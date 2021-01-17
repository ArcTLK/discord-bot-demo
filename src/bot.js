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
                    status: 'New'
                })
                .write();
            
            msg.reply(`Hey, thanks for your suggestion! I will alert the admins about the same asap :)`);
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
                    return `${i + 1}. ${x.user.username}#${x.user.discriminator} [${DateTime.fromMillis(x.createdTimestamp).toFormat('d LLL, h:mm a')}]: ${x.suggestion}`;
                }).join('\n')}\`\`\``);
            }
            else {
                msg.channel.send('No suggestions found!');
            }
        }
        else if (args[0] === 'accept') {
            if (!data.get('admins').map(x => x.id).includes(msg.author.id).value()) {
                return msg.reply('You are not an admin!');
            }

            const index = parseInt(args[1]);
            const suggestions = data.get('suggestions');
            if (suggestions.size() >= index || suggestions.size() < 0) {
                return msg.reply('Invalid suggestion!');
            }
            // TODO: change status of suggestion
            
        }
        else if (args[0] === 'id') {
            msg.reply(`Your id is ${msg.author.id}`);
        }
    }
});

client.login(process.env.BOT_TOKEN);