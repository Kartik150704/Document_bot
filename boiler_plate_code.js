const qrcode = require('qrcode-terminal');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Client, LocalAuth ,NoAuth} = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const { create } = require('domain');
const { ChildProcess } = require('child_process');
const { spawn } = require('child_process');
const { waitForDebugger } = require('inspector');

const scan_type = {}
class Queue {
    constructor() {
        this.items = [];
    }

    // add an item to the back of the queue
    enqueue(item) {
        this.items.push(item);
    }

    // remove and return the front item from the queue
    dequeue() {
        return this.items.shift();
    }

    // return the front item of the queue without removing it
    peek() {
        return this.items[0];
    }

    // return true if the queue is empty, false otherwise
    isEmpty() {
        return this.items.length === 0;
    }

    // return the number of items in the queue
    size() {
        return this.items.length;
    }
}

waiting_list = new Queue();


let persons = [];

const map = {};
const created = {}
const count = {}
const qresolve = {}
async function converter(source1, dest, message, index, args) {
    console.log(index);

    let commands = []
    for (let i = 1; i <= index; i++) {
        let source = source1 + i + ".jpg";
        let index1 = i;
        let command = `python3 ./image2scan/scan.py --image ${source} --dest ${dest} --index ${index1}`;
        commands.push(command);

    }
    let n = count[message.from];
    n = `${n}`
    let destination = './' + (message.from).substring(0, 12) + "/\n";
    if (scan_type[message] == 0) {
        n = destination + n + "\n" + args[0] + "\n" + "Image";

    }
    else {
        n = destination + n + "\n" + args[0] + "\n" + "Omage";
    }
    console.log("n ki value " + n);
    fs.writeFile('./reader.txt', n, (err) => {


        if (err) throw err;
    });

    let command1 = "python3 combiner.py"
    commands.push(command1)
    console.log(commands);
    async function runCommands(commands) {
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const childProcess = spawn(command, { shell: true });

            await new Promise((resolve, reject) => {
                childProcess.stdout.on('data', (data) => {
                    console.log(`Output from ${command}: ${data}`);
                });

                childProcess.stderr.on('data', (data) => {
                    console.error(`Error from ${command}: ${data}`);
                });

                childProcess.on('close', (code) => {
                    console.log(`${command} exited with code ${code}`);
                    resolve();
                });

                childProcess.on('error', (err) => {
                    reject(err);
                });
            });
        }
    }

    await runCommands(commands)
        .then(() =>
            console.log('All commands executed successfully.')
        )
        .catch((err) => console.error(`Error executing commands: ${err}`));

    let pdfMedia = await MessageMedia.fromFilePath("./" + (message.from).substring(0, 12) + `/${args[0]}.pdf`);
    client.sendMessage(message.from, pdfMedia);
    deletefolder("./" + (message.from).substring(0, 12));
    waiting_list.dequeue();
    map[message.from] = 0;
    if (waiting_list.isEmpty() == false) {
        let top_message = waiting_list.peek();
        let top_msg = parse(top_message);
        let top_args = top_msg.args;
        let x = await converter(y, __dirname + "/" + (top_message.from).substring(0, 12), top_message, count[top_message.from], top_args);
    }


    // }


    // }
    console.log("Returning from converter");
    // executeCommands();
}




const client = new Client({
    authStrategy: new NoAuth(),
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
    let args = msg.args;
    console.log(msg);
    if(msg.command == "help")
    {
        let s = "You are welcome on this WhatsApp number.\n\n"
        s += "This is a document handling bot created by Kartik Yadav. Special thanks to Sahil Mangla and Anant Prakash for their contributions.\n"
        s += "If you have any questions or need assistance, please feel free to reach out to us.\n"
        s += "Contact Email: kartik150704@gmail.com\n\n"
        s += "Here are the available commands:\n\n"
        s += "1. '.conv' - This command converts multiple images to PDF without scanning them.\n"
        s += "   To use this command, follow these steps:\n"
        s += "   - Send the command '.conv' to initiate the conversion.\n"
        s += "   - Send the images you want to convert.\n"
        s += "   - Send the command '.done <file_name>' to specify the PDF's name. For example, '.done kartik' will create a PDF named 'kartik'.\n\n"
        s += "2. '.scan' - This command scans the images and then converts them into a PDF.\n"
        s += "   To use this command, follow these steps:\n"
        s += "   - Send the command '.scan' to initiate the scanning and conversion process.\n"
        s += "   - Send the images you want to scan and convert.\n"
        s += "   - When you are done, send the command '.done <file_name>' to specify the PDF's name as mentioned above.\n\n"
        s += "Note: Please avoid using inverted commas in your commands.\n"
        client.sendMessage(message.from,s);

    }
    if (msg.command == "scan") {
        if (map[message.from] == 1) {
            client.sendMessage(message.from, "Your another file already in queue,please wait");
            qresolve[message.from] = 0;


        }
        else {
            client.sendMessage(message.from, "Scanning started , send your images one by one \n.");
            map[message.from] = 1;
            created[message.from] = 0;
            count[message.from] = 1;
            qresolve[message.from] = 1;
            scan_type[message] = 1;

        }


        // client.sendMessage("Send your image one by one");
    }
    else if (msg.command == "conv") {
        if (map[message.from] == 1) {
            client.sendMessage(message.from, "Your another file already in queue,please wait");
            qresolve[message.from] = 0;

        }
        else {
            client.sendMessage(message.from, "Scanning started , send your images one by one \n.");
            map[message.from] = 1;
            created[message.from] = 0;
            count[message.from] = 1;
            qresolve[message.from] = 1;
            scan_type[message] = 0;


        }


        // client.sendMessage("Send your image one by one");
    }

    else if (msg.command == "done") {
        // map[message.from]=0;
        if (count[message.from] == 1) {
            client.sendMessage(message.from, "Please send something first !!!!! ")
            end_command(message);
        }
        else if (qresolve[message.from] == 1) {
            let image_path = __dirname + "/" + (message.from).substring(0, 12) + "/Image";
            y = image_path
            if (waiting_list.isEmpty() == true) {
                waiting_list.enqueue(message.from);
                client.sendMessage(message.from, "Converting your images to a final pdf .......")
                let x = await converter(y, __dirname + "/" + (message.from).substring(0, 12), message, count[message.from], args);
                map[message.from] = 0;

            }
            else {
                waiting_list.enqueue(message);
                console.log(waiting_list);
            }


        }
        else {
            client.sendMessage(message.from, "In queue !!!!!!!")
        }


        // client.sendMessage("We are scanning these images");
    }
    
    if (map[message.from] == 1 && qresolve[message.from] == 1) {
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
            const filePath = path.resolve(__dirname + `/` + (message.from).substring(0, 12), name);
            fs.writeFileSync(filePath, media.data, { encoding: 'base64' });
            console.log('Attachment saved!');



            return;
        }

    }
    if (msg.command == "end") {
        end_command(message);
    }
});

function end_command(message) {

    map[message.from] = 24;
    client.sendMessage(message.from, "Command restarted");
    deletefolder("./" + (message.from).substring(0, 12))
}
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

function deletefolder(folder_path) {
    fs.rmdir(folder_path, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Folder deleted successfully');
        }
    });
}
