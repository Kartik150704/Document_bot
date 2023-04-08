const qrcode = require('qrcode-terminal');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Client, LocalAuth } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const { create } = require('domain');
const { ChildProcess } = require('child_process');
const { spawn } = require('child_process');

let persons = [];

const map = {};
const created = {}
const count = {}
async function converter(source1, dest, message, index) {
    console.log(index);

    let commands = []
    // for(let i=1;i<=index;i++)
    // {
    //     let source=source1+i+".jpg";
    //     index1=i;
    //     let command = `python .\\image2scan\\scan.py --image ${source} --dest ${dest} --index ${index1}`;
    //     commands.push(command);

    // }
    let n = count[message.from];
    n = `${n}`
    let destination = './' + (message.from).substring(0, 12) + "/\n";
    n = destination + n;
    console.log(n);
    fs.writeFile('reader.txt', n, (err) => {

        // In case of a error throw err.
        if (err) throw err;
    })
    // console.log(commands);
    let command1 = "python combiner.py"
    commands.push(command1)
    console.log(commands);
    for (const command of commands) {
        // console.log(command);
        // await exec(command, async (err, stdout, stderr) => {
        //     if (err) {
        //         console.error(`Error executing command: ${err}`);
        //         return;
        //     }
        //     console.log(`Command output: ${stdout}`);
        //     console.log('Command output done');
        //     // let pdfMedia = await MessageMedia.fromFilePath('./Image1.pdf');
        //     // client.sendMessage(message.from, pdfMedia);
        //     //   return;
        // await exec(command, async (err, stdout, stderr) => {
        //     if (err) {
        //         console.error(`Error executing command: ${err}`);
        //         return;
        //     }
        //     console.log(`Command output: ${stdout}`)
        // });
        // const { stdout, stderr } = await exec(command);
        const childProcess = spawn(command);

        // Terminate child process when the parent process is terminated
        process.on('SIGTERM', () => childProcess.kill());
        let pdfMedia = MessageMedia.fromFilePath('./Output.pdf');
        client.sendMessage(message.from, pdfMedia);

    }


    // }
    console.log("Returning from converter");
}




const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--unhandled-rejections=strict"
        ]
    }
});



client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
let flag = 0;
let i = 1;
client.on('message', async (message) => {
    let msg = parse(message);
    console.log(msg);
    if (msg.command == "scan") {

        map[message.from] = 1;
        created[message.from] = 0;
        count[message.from] = 1;

        // client.sendMessage("Send your image one by one");
    }
    else if (msg.command == "done") {
        map[message.from] = 0;

        let image_path = __dirname + "\\" + (message.from).substring(0, 12) + "\\Image";
        y = image_path

        let x = await converter(y, __dirname + "\\" + (message.from).substring(0, 12), message, count[message.from]);

        // client.sendMessage("We are scanning these images");
    }
    if (map[message.from] == 1) {
        if (message.hasMedia) {
            const media = await message.downloadMedia();

            if (created[message.from] == 0) {
                created[message.from] = 1;
                let f_name = (message.from).substring(0, 12);
                fs.mkdir(f_name, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                });

            }
            let name = "Image" + count[message.from] + ".jpg";
            console.log(__dirname);
            count[message.from]++;
            const filePath = path.resolve(__dirname + `\\` + (message.from).substring(0, 12), name);
            fs.writeFileSync(filePath, media.data, { encoding: 'base64' });
            console.log('Attachment saved!');



            return;
        }

    }
    // console.log(message.from, message.body);
    // var bot_reply = parse(message);
    // if (bot_reply != "") {
    //     client.sendMessage(message.from, bot_reply.trim());

    // }
});


function parse(message) {
    var body = message.body;
    // console.log();
    if (body[0] === '.') {
        // User send a command
        // Get which command
        // body = body.toLowerCase();
        body = body.replace(/ +(?= )/g, '');  // Remove double spaces
        body = body.replace(". ", ".");

        let command = body.split(' ')[0].substring(1);
        let args = body.split(' ').slice(1);

        // return "Your command:\n\n" + command;
        // switch (command) {
        //     case 'start':
        //         return start();
        //     case 'help':
        //         return help();
        //     case 'hi':
        //         let sender=hii(message.from);
        //         return sender;
        //     case 'owner':
        //         return "Kartik Yadav"
        //     case 'register':
        //         return register(args[0],message.from);
        //     default:
        //         return "Command not found!";
        // }

        let ret = { command: command, args: args };
        return ret;

    } else {
        // User send a message
        return "";
    }
}

function start() {

    return "systummmm start";

}

function help() {
    let s = "You can use following commands till now , but surely we will add more in future\n"
        + "1 .start\n2 .help\n3 .owner\n"
    return s + "This is Scanner_bot." + "If u send an Image , it converts it to a pdf\n"
        + "and send back to you. The scanner is not so much accurate\nat this moment ,but "
        + "we are improving it and sometime it gives complete blank image , if camera of your\n"
        + "phone is not so good, we want apology for the same. ";
}

async function Video(args, message) {
    let link = args[0];
    console.log(link);
    // downloader(link, message.from);
    let media = await MessageMedia.fromFilePath('./Output.pdf');
    await client.sendMessage(message.from, media);
}

function hii(id1) {
    console.log(persons);
    for (let i = 0; i < persons.length; i++) {
        if (persons[i].id == id1) {
            return "hi " + persons[i].sender;
        }
    }
    return "We don't talk to unknown , first register urself by sending\n .register<space><yourname>";

}



function register(sender, id) {
    let flag = 0;
    for (let i = 0; i < persons.length; i++) {
        if (persons[i].id == id) {
            return "you are already registerd"
        }
    }
    let s = { id: id, sender: sender };
    persons.push(s);
    return "You are registered now";
}

