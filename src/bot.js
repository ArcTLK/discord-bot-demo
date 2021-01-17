require('dotenv').config();

const Discord = require('discord.js');

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.startsWith(`!${process.env.BOT_TAG} `)) { // accept only messages starting with !${BOT TAG} 
        // TODO: add bot to akshay's discord server
        const args = msg.content.split(' ').slice(1);
        if (args[0] == 'suggest') {}
    }
});

client.login(process.env.BOT_TOKEN);