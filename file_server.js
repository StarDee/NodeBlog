'use strict';
const
    fs=require('fs'),
    url=require('url'),
    path=require('path'),
    http=require('http');
// 从命令行参数获取root目录，默认是当前目录
const root=path.resolve(process.argv[2]||'.');

console.log('Static root dir:'+ root);

// 创建服务器
const server=http.createServer(function (req,res) {
    const pathname=url.parse(req.url).pathname;

    const filepath=path.join(root, pathname);
    fs.stat(filepath,function (err,stats) {
        if(!err && stats.isFile()){
            console.log('200'+req.url);
            res.writeHead(200);
            fs.createReadStream(filepath).pipe(res);
        } else {
            console.log('404'+req.url);
            res.writeHead(404);
            res.end('404 Not Fount');
        }


    });
});

server.listen(8008);
console.log('Server is running at http://127.0.0.1:8008');