const readline = require('readline');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const Emmiter = require('events');

let emmiter = new Emmiter();
let position = __dirname;

try {
    emmiter.on('ls', ()=>{
        let bodyDir =  LookDir(position);
        Distribution(bodyDir);
    });
    emmiter.on('cdLow',()=>{
        let reg = /(\\\w+)$/
        position = position.slice(0,position.match(reg).index)
    });
    emmiter.on('cdUp',  (foleder)=>{
        let status =  IsDirectory(path.join(position,foleder))
        if(status===200){
            position = path.join(position,foleder);
        }
    })
    emmiter.on('about',(path)=>{
        let status = IsDirectory(path);
        if(status===200){
            console.log('OK',path);
            let res = fs.statSync(path);
            console.log('owner - '+res.uid);
            console.log('size - '+res.size);
            console.log('chomd - ' + (res.mode & parseInt('777', 8)).toString(8))
            console.log('owner eXecute:  ' + (res["mode"] & 100 ? 'x' : '-'));
            console.log('owner Write:    ' + (res["mode"] & 200 ? 'w' : '-'));
            console.log('owner Read:     ' + (res["mode"] & 400 ? 'r' : '-'));
        }
    })
    emmiter.on('mkdir',(dir_name)=>{
        try {
            fs.mkdirSync(path.join(position,dir_name),{ recursive: true }, (err) => {
                if (err) {
                  return console.error(err);
                }
                console.log('Directory created successfully!');
              })  
        } catch (error) {
            console.log('we have error with creating dir');
        }
    })
    emmiter.on('mkfile',(file_name)=>{
        try {
            fs.appendFileSync(path.join(position,file_name),(err)=>{
                if(err) console.log(err);
                else console.log('file created');
            });
        } catch (error) {
            console.log('we have error when created file')
        }
    });
    emmiter.on('rmDir',(delete_name)=>{
        try {
            fs.rmdirSync(path.join(position,delete_name),{recursive:true});
            console.log('rm sucsesfull');
        } catch (error) {
            console.log('we have problem with deletet dir')
            console.log(error);
        }
    })
    emmiter.on('rmFile',(delete_name)=>{
        try {
            fs.unlinkSync(path.join(position,delete_name));
            console.log('file delete successful');
        } catch (error) {
            console.log('we have problem with deletet dir')
            console.log(error);
        }
    })
    
    emmiter.on('rename',(old_name,new_name)=>{
        try {
            let old_p = path.join(position,old_name).toString();
            let new_p = path.join(position,new_name).toString()
            fs.renameSync(old_p,new_p,(err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log('rename successful');
                }
            })
        } catch (error) {
            console.log(error);
            console.log('we have error with rename')
        }
    })
    
    emmiter.on('readFile',(name_file)=>{
        try {
          let data = fs.readFileSync(path.join(position,name_file),'utf-8');
          console.log(data);
        } catch (error) {
            fconsole.log(error);
        }
    });
    emmiter.on('writeFile',(name_file,text)=>{
        try {
            new_text = '\n'+ text;
            const data = new Uint8Array(Buffer.from(new_text));
            fs.appendFileSync(path.join(position,name_file),data);
            console.log('write file succsesfull');
        } catch (error) {
            console.log(error)
        }
    })
    
    
    
    const Distribution = (array) =>{
        if(array!==undefined || null){
        for(let item of array){
            if(fs.statSync(path.join(position,item)).isDirectory()){
                console.log(colors.blue(item));
            }
            else{
                console.log(colors.green(item));
            }
        }
    }
    }
    
    const IsDirectory = (path) =>{
        let res = 400;
        try {
            if(fs.accessSync(path)===undefined){
                res = 200;
            }
        } catch (error) {
            console.log('you have error with folder');
        }
        return res;
    }
    const LookDir =  (path) =>{
        let status =  IsDirectory(path);
        if(status ===200){
            let bodyDir = fs.readdirSync(path);
            return bodyDir;
        }
        else{
            console.log('we have error');
        }
    }
    
    const rl = readline.createInterface({
        input:process.stdin,
        output:process.stdout
    })
    rl.on('close',()=>{
        console.log('goodbay');
    })
    const question = ()=>{
        rl.question(position+'> ',(answer)=>{
            FindCom(answer);
            question();
        })
    }
    const FindCom = (command) =>{
        let result = Reg(command);
        switch (result[1]) {
            case 'help':
                help();
                break;
            case 'ls':
                 emmiter.emit('ls');
                break;
            case 'cd':
                cdPathEmmiter(result[2]);
                break;    
            case 'mkdir':
                makeDir(result[2]);
                break;
            case 'mkfile':
                mkFile(result[2]);
                break;
            case 'rename':
                renameElement(result[2],result[3]);
                break;  
            case 'rfile':
                readFile(result[2]);
                break;
            case 'wfile':
                writeFile(result[2]);
                break;    
            case 'rm':
                removeElement(result[2],result[3]);
                break;
            case 'about':
                aboutFile(result[2])
                break; 
            case 'end':
                console.log('goodbay');
                process.exit();
                break;
            default:
                console.log('not correct command, if you want see all command write --help');
                break;
        }
    }
    
    const Reg = (command)=>{
        let reg = /\s?(\w+)\s?(\.+|-?\w+\.\w+|-?\w+)?\s?(\w+\.\w+|\w+)?/;
        //console.log(command.match(reg));
        return command.match(reg);
    }
    
    const cdPathEmmiter = (path) =>{
        if(path === '..'){ 
            emmiter.emit('cdLow');
        }
        else {
            emmiter.emit('cdUp',path);
        }
    }
    const aboutFile = (namePath) =>{
        let joinPath = path.join(position,namePath)
        emmiter.emit('about',joinPath);
    }
    const makeDir = (name_dir) =>{
        emmiter.emit('mkdir',name_dir);
    }
    const mkFile = (name_file)=>{
        emmiter.emit('mkfile',name_file);
    }
    const removeElement = (option,name_delete)=>{
       rl.question('you realy want delete if yes push Y ',(answer)=>{
           if(answer.toLowerCase()==='y'){
            switch (option) {
                case '-d':
                    emmiter.emit('rmDir',(name_delete));
                    break;
                case '-f':
                    emmiter.emit('rmFile',(name_delete));
                    break;    
                default:
                    console.log('you are stupid boy, you can`t work fith my file system, i hate you');
                    break;
            }
           }
           else{
               console.log('you don`t delete');
           }
    
           question()
       })
    }
    const renameElement = (old_name,new_name)=>{
        emmiter.emit('rename',old_name,new_name);
    }
    const readFile = (file_name)=>{
        emmiter.emit('readFile',file_name);
    }
    const writeFile = async (file_name) =>{
        rl.question('what do you want write in file: ',(answer)=>{
            emmiter.emit('writeFile',file_name,answer);
            question();
        })
    }
    
    
    const help = () =>{
        let obj = [
            {command:'cd:', option:'transition between folders, this command have two option .. | [name directory]'},
            {command:'ls:', option:'viewing the directory you need write > ls'},
            {command:'rm:', option:'delete directory with option -d, delete file with option -f,  you need write > rm -d [name directory] | rm -f [name file]'},
            {command:'wfile:', option:'write file you need write > wfile [name file] , after that write message'},
            {command:'rfile:', option:'read file you need write > rfile [name file]'},
            {command:'mkfile:', option:'create file you need write > mkfile [name file]'},
            {command:'mkdir:', option:'create directory you need write > mkdir [name directory]'},
            {command:'rename:', option:'rename file or directory you need write write > rename [old name,new name]'},
            {command:'about:', option:'you can see information about file or directory you need to write > about [name]'},
            {command:'end:', option:'end proggram'},
            {command:'GoodLuck ', option:')))))))))))'},
    
        ]
        obj.forEach(item=>{
            console.log(item.command, item.option);
        })
    }
    question();
} catch (error) {
    console.log(error)
    question()
}

