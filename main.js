const axios = require('axios')
const fs = require('fs')
const config = require('./config')
const scrape = require('./scrapper')
const Canvas = require('canvas')
const championsArray = require('lol-champions')
const Discord = require('discord.js')
const client = new Discord.Client()

const createEmbed = (imagePath, imageName, name, role, url) => {
  const attachment = new Discord.MessageAttachment(imagePath, `${imageName}.png`);
  const embed = new Discord.MessageEmbed()
          .setTitle(`🔰 **${name}** | **${role}**`)
          .setDescription("Clique sur le lien pour plus d'informations!")
          .setURL(url)
          .attachFiles(attachment)
          .setImage('attachment://runes.png')
          .setColor('#0099ff')
  return embed
}

const isChampionExist = (name) => {
  if (championsArray.find(e => {return e.id === name.toLowerCase()})) return true
  else return false
}

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
    await downloadImage(res.runes.masteries[i], `${__dirname}/src/img/runes/masteries/masteries${i}.png`)
  }

  for (let i = 0; i < res.runes.fragments.length; i++) {
      await downloadImage(res.runes.fragments[i], `${__dirname}/src/img/runes/fragments/fragments${i}.png`)
  } 

  return res.url
}

client.on('ready', () =>  console.log('Logged in !'))

client.on('message', async message => {
    const prefix = config.prefix
    if (!message.content.startsWith(prefix) || message.author.bot) return 
    const args = message.content.slice(prefix.length).trim().split(" ")
    const command = args.shift().toLowerCase()

    if(command === 'runes') {
        if (args.length < 2) return message.channel.send('>>> 🔰 commande **incomplète**')
        if (!isChampionExist(args[0], championsArray)) return message.channel.send(`>>> 🔰 Le champion **${args[0]}** n'existe pas ou est mal orthographié`)

        scrape(args[0], args[1]).then(async res => {
            createImages(res).then( async (res) => {

              const canvas = Canvas.createCanvas(440,150)
              const context = canvas.getContext('2d')
              const background = await Canvas.loadImage('./src/img/background.png')
              context.drawImage(background, 0, 0, canvas.width, canvas.height)
              
              let position = 20
                for (let i = 0; i < 6; i++) {
                let mastery = await Canvas.loadImage(`./src/img/runes/masteries/masteries${i}.png`)
                context.drawImage(mastery, position,20,40,40)
                position += 70
              }

              position = 120
              for (let i = 0; i < 3; i++) {
                let fragment = await Canvas.loadImage(`./src/img/runes/fragments/fragments${i}.png`)
                context.drawImage(fragment, position ,100, 30,30)
                position += 75
              }

              let buffer = canvas.toBuffer()
              fs.writeFileSync(`${__dirname}/src/img/canvas/runes.png`, buffer)

              const name = args[0].charAt(0).toUpperCase() + args[0].slice(1)
              const role = args[1].toUpperCase()
              let embed = createEmbed('./src/img/canvas/runes.png', 'runes', name, role, res)

              message.channel.send(embed)
            })
        })  
    }
})


client.login(config.token)
