require('dotenv').config();
const { DateTime } = require("luxon");
const _ = require('lodash');

const Discord = require('discord.js');
const client = new Discord.Client();

const low = require('lowdb');
const FileSync =  require('lowdb/adapters/FileSync');

const data = low(new FileSync('data.json'));

// init database
data.defaults({
        suggestions: [],
        admins: [
            { id: process.env.ADMIN_ID, name: 'Admin' }
        ]
    })
    .write();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.startsWith(`!${process.env.BOT_TAG} `)) { // accept only messages starting with !${BOT TAG} 
        const args = msg.content.split(' ').slice(1);
        
        if (args[0] === 'suggest') {
            const suggestion = args.slice(1).join(' ');
            
            data.get('suggestions')
                .push({
                    suggestion,
                    user: {
                        id: msg.author.id,
                        username: msg.author.username,
                        discriminator: msg.author.discriminator
                    },
                    createdTimestamp: msg.createdTimestamp,
                    status: 'Considering'
                })
                .write();
            
            msg.reply(`Hey, thanks for your suggestion!`);
        }
        else if (args[0] === 'list') {
            let suggestions = data.get('suggestions');

            if (args[1] === 'all') {
                if (!data.get('admins').map(x => x.id).includes(msg.author.id).value()) {
                    return msg.reply('You are not an admin!');
                }
            }
            else {
                suggestions = suggestions.filter(x => x.user.id === msg.author.id);
            }

            if (suggestions.size() > 0) {
                msg.channel.send(`\`\`\`${suggestions.map((x, i) => {
                    return `${i + 1}. ${x.user.username}#${x.user.discriminator} [${DateTime.fromMillis(x.createdTimestamp).toFormat('d LLL, h:mm a')}]: ${x.suggestion}\nStatus: ${x.status}`;
                }).join('\n')}\`\`\``);
            }
            else {
                msg.channel.send('No suggestions found!');
            }
        }
        else if (args[0] === 'accept' || args[0] === 'reject' || args[0] === 'complete' || args[0] === 'consider') {
            if (!data.get('admins').map(x => x.id).includes(msg.author.id).value()) {
                return msg.reply('You are not an admin!');
            }

            const index = parseInt(args[1]) - 1;
            const suggestions = data.get('suggestions');
            
            if (index >= suggestions.size() || index < 0) {
                return msg.reply('Invalid suggestion!');
            }

            const suggestion = suggestions.get(`[${index}]`).value();
            suggestion.status = args[0] === 'accept' ? 'Accepted' : args[0] === 'reject' ? 'Rejected' : args[0] === 'complete' ? 'Completed' : 'Considering';
            suggestions.write();
            msg.reply(`The suggestion **${suggestion.suggestion}** has been ${args[0] === 'accept' ? 'accepted' : args[0] === 'reject' ? 'rejected' : args[0] === 'complete' ? 'completed' : 'set as under consideration'}!`);
        }
        else if (args[0] === 'id') {
            msg.reply(`Your id is ${msg.author.id}`);
        }
        else {
            msg.reply(`Sorry, I don't recognize the command: **${args[0]}**`)
        }
    }
});

client.login(process.env.BOT_TOKEN);