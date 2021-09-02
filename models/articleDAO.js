var connection = require('./db')

exports.selectShowImage = () => new Promise((resolve, reject)=>{
    const query = 'SELECT * FROM article WHERE date_start_post<=date(now()) and date_end_post>=date(now()) and type=?';
    connection.query(query, 'image', function (error, results, fields){
        if(error)
            reject(error);
        else
            resolve(results);
    })
})

exports.selectShowVideo = () => new Promise((resolve, reject)=>{
    const query = 'SELECT * FROM article WHERE date_start_post<=date(now()) and date_end_post>=date(now()) and type=?';
    connection.query(query, 'video', function (error, results, fields){
        if(error)
            reject(error);
        else
            resolve(results);
    })
})

exports.insertArticle = (body, placeSum, imgFilename, writerEmail, fileType)=> new Promise((resolve, reject)=>{
    let query = `INSERT INTO article(title, date_start_post, date_end_post, place, file_path, writer_email, message, type) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [body.title, body.date_start_post, body.date_end_post, placeSum, imgFilename, writerEmail, body.message, fileType],
    function(error, results, fields){
        if(error){
            reject(error);
        }else{
            resolve(results);
        }
    });
})

exports.selectArticles=()=>new Promise((resolve, reject)=>{
    let query = 'SELECT * FROM article ORDER BY idarticle DESC';
    connection.query(query, (error, results, fields)=>{
        if(error){
            reject(error);
        }else{
            resolve(results);
        }
    })
})


// exports.selectAllArticlesCount = (cb)=>{
//     connection.query('SELECT COUNT(*) FROM article', 
//     (error, results, fields)=>{
//         if(error){
//             console.log(error);
//         }else{
//             cb(results);
//         }
//     })
// }

// exports.selectArticles = (cb)=>{
//     let sql = 'SELECT * FROM article ORDER BY idarticle DESC'
//     connection.query(sql, (error, results, fields)=>{
//         if(error){
//             console.log(error);
//         }else{
//             cb(results);
//         }
//     })
// }

// exports.selectArticlesById = (id, cb)=>{
//     let sql = 'SELECT * FROM article WHERE idarticle = ?'
//     let values = [id]
//     connection.query(sql, values, (error, results, fields)=>{
//         if(error){
//             console.log(error);
//         }else{
//             cb(results);
//         }
//     })
// }



// exports.deleteArticle = (id, cb)=>{
//     sql = `DELETE FROM article WHERE idarticle = ${id}`;
//     connection.query(sql, function(error, results, fields){
//         if(error){
//             console.log('DELETE ERROR');
//         }else{
//             cb();
//         }
//     })
// }