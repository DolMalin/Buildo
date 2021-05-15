require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const config = require('./config')
const scrape = require('./scrapper')
const Canvas = require('canvas')

const Discord = require('discord.js')
const client = new Discord.Client()

const downloadImage = (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  )

const createImages = async (res) => {
  for (let i = 0; i < res.runes.masteries.length; i++) {
    await downloadImage(res.runes.masteries[i], `./src/img/runes/masteries/masteries${i}.png`)
  }

  for (let i = 0; i < res.runes.fragments.length; i++) {
      await downloadImage(res.runes.fragments[i], `./src/img/runes/fragments/fragments${i}.png`)
  } 
}

client.on('ready', () =>  console.log('Logged in !'))

client.on('message', async message => {
    const prefix = config.prefix
    if (!message.content.startsWith(prefix) || message.author.bot) return 
    const args = message.content.slice(prefix.length).trim().split(" ")
    const command = args.shift().toLowerCase()

    if(command === 'runes') {
        if (args.length < 1) return message.channel.send('>>> 🔰 commande **incomplète**')
        if (args.length < 2) return message.channel.send('>>> 🔰 commande **incomplète**')

        scrape(args[0], args[1]).then(async res => {

            createImages(res).then( async () => {
              const canvas = Canvas.createCanvas(440,150)
              const context = canvas.getContext('2d')
              const background = await Canvas.loadImage('./src/img/background.png')
              context.drawImage(background, 0, 0, canvas.width, canvas.height)

              const masteries0 = await Canvas.loadImage('./src/img/runes/masteries/masteries0.png')
              const masteries1 = await Canvas.loadImage('./src/img/runes/masteries/masteries1.png')
              const masteries2 = await Canvas.loadImage('./src/img/runes/masteries/masteries2.png')
              const masteries3 = await Canvas.loadImage('./src/img/runes/masteries/masteries3.png')
              const masteries4 = await Canvas.loadImage('./src/img/runes/masteries/masteries4.png')
              const masteries5 = await Canvas.loadImage('./src/img/runes/masteries/masteries5.png')

              const fragments0 = await Canvas.loadImage('./src/img/runes/fragments/fragments0.png')
              const fragments1 = await Canvas.loadImage('./src/img/runes/fragments/fragments1.png')
              const fragments2 = await Canvas.loadImage('./src/img/runes/fragments/fragments2.png')
              context.drawImage(masteries0, 20,20, 40,40)
              context.drawImage(masteries1, 90,20, 40,40)
              context.drawImage(masteries2, 160,20, 40,40)
              context.drawImage(masteries3, 230,20, 40,40)
              context.drawImage(masteries4, 300,20, 40,40)
              context.drawImage(masteries5, 370,20, 40,40)
              context.drawImage(fragments0, 120,100, 30,30)
              context.drawImage(fragments1, 195,100, 30,30)
              context.drawImage(fragments2, 270,100, 30,30)
              const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'attachment.png')

              const name = args[0].charAt(0).toUpperCase() + args[0].slice(1)
              const role = args[1].toUpperCase()
              message.channel.send(`>>> 🔰 **${name}** | **${role}**`, attachment)
            })
        })  
    }
})


client.login(config.token)