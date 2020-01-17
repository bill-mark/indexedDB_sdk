const openDB = function(db_name){   //打开数据库
   return new Promise((resolve,reject)=>{
      let request = window.indexedDB.open(db_name)
      request.onerror = function(event){
        reject("打开数据库失败"+event)
      }
      request.onsuccess = function(event){
        resolve(event.target.result)
      }
      request.onupgradeneeded = function(event){
          console.log('openDB 数据库更新')
          let db = event.target.result
          if(!db.objectStoreNames.contains('publisher')){
            let objectStore = db.createObjectStore('publisher',{keyPath:'id'})
            objectStore.createIndex('name', 'name', { unique: true })
          }

          if(!db.objectStoreNames.contains('books')){
            let objectStore = db.createObjectStore('books',{keyPath:'id'})
            objectStore.createIndex('name', 'name', { unique: true })
          }

          if(!db.objectStoreNames.contains('bookcontents')){
            let objectStore = db.createObjectStore('bookcontents',{keyPath:'id'})
          }          
      }
   })
}

const clearData = async function(db_name,objectstore_name){  //清除对象实例
     let db = await openDB(db_name)
     let request = db
        .transaction(objectstore_name,'readwrite')  //指定对象实例和模式
        .objectStore(objectstore_name)  //拿到对象实例
        .clear()
        return new Promise((resolve,reject)=>{
             request.onsuccess = function(e){
              return resolve(e)
             }
             request.onerror = function(e){
              return reject(e)    
             }
        })
}

const insert = async function(db_name,objectstore_name,args){  //增加
      let db = await openDB(db_name)  //获取数据库实例
      let request = db
         .transaction(objectstore_name,'readwrite')  //指定对象实例和模式
         .objectStore(objectstore_name)  //拿到对象实例

      let add_result
      if(Object.prototype.toString.call(args) == '[object Array]'){
         args.forEach( (item)=>{
             add_result = request.add(item)
         })
      }else{
         add_result = request.add(args)
      }

      return new Promise((resolve,reject)=>{
           add_result.onsuccess = function(e){
            return resolve(e)
           }
           add_result.onerror = function(e){
            return reject(e)    
           }
      })
}

const go_create_table = function(db_name,new_objectstore,keypath){  //准备更新表
     	  let request = window.indexedDB.open(db_name)
        request.onsuccess = function(event){
        	let db = event.target.result
          create_table(db_name,db.version+1,new_objectstore,keypath)
        }
}

const create_table = function(db_name,version,new_objectstore,keypath){  //新增表
	let request = window.indexedDB.open(db_name,version)
	request.onupgradeneeded = function(event){
		let db = event.target.result
		if(!db.objectStoreNames.contains(new_objectstore)){
			let objectStore = db.createObjectStore(new_objectstore,{keyPath:keypath})
		}	
	}
}

const getData = async function(db_name,objectstore_name,value,index_name,){  //读取数据
   let db = await openDB(db_name)
   let store = db
         .transaction(objectstore_name,'readwrite')  //指定对象实例和模式
         .objectStore(objectstore_name)  //拿到对象实例

   let request
   if(index_name){  //通过索引
       let index = store.index(index_name)
       request = index.get(value)
   }else{  //没有索引 通过主键
       request = store.get(value)
   }

   return new Promise((resolve,reject)=>{
       request.onsuccess = function(e){
        return resolve(e.target.result)
       }
       request.onerror = function(e){
        return reject(e)
       }
   })
}

const readAll = async function(db_name,objstore_name){  //读取对象实例所有数据
   let db = await openDB(db_name)
   let store = db.transaction(objstore_name).objectStore(objstore_name)
   let request = store.getAll()

   return new Promise((resolve,reject)=>{
      request.onsuccess = function(e){
        return resolve(e.target.result)
      }
      request.onerror = function(e){
        return reject(e)
      }
   })
}

const readFirst = async function(db_name,objstore_name){  //读取对象实例第一条数据
  let db = await openDB(db_name)
  let store = db.transaction(objstore_name).objectStore(objstore_name)
  let cursor = store.openCursor()

  return new Promise((resolve,reject)=>{
    cursor.onsuccess = function(e){
      db.close()
      return resolve(e.target.result)
    }
    cursor.onerror = function(e){
      db.close()
      return resolve(e)
    }
  })
}

const update = async function(db_name,objstore_name,args){  //更新
   let db = await openDB(db_name)
   let request = db.transaction(objstore_name,'readwrite')
        .objectStore(objstore_name)
        .put(args)

   return new Promise((resolve,reject)=>{
      request.onsuccess = function(e){
        return resolve(e)
      }
      request.onerror = function(e){
        return reject(e)
      }
   })

}

export default{
	insert:insert,
	create_table:create_table,
  go_create_table:go_create_table,
  getData:getData,
  readAll:readAll,
  readFirst:readFirst,
  clearData:clearData,
  update:update
}





