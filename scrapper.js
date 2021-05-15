const axios = require('axios')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const championPage = (championName, championRole) => {
    if (championName == null) return
    let url = ''
    switch(championRole) {
        case 'bot' || 'bottom' || 'bas' || 'adc' :
            url = `https://euw.op.gg/champion/${championName}/statistics/bot`
            break
        case 'supp' || 'support' :
            url = `https://euw.op.gg/champion/${championName}/statistics/support`
            break
        case 'mid' || 'middle' || 'midlane' :
            url = `https://euw.op.gg/champion/${championName}/statistics/mid`
            break
        case 'jungle' || 'jung' :
            url = `https://euw.op.gg/champion/${championName}/statistics/jungle`
            break
        case 'top' || 'toplane' : 
            url = `https://euw.op.gg/champion/${championName}/statistics/top`
            break
        default :
            url =  `https://euw.op.gg/champion/${championName}/statistics/`
    }

    return url
}

const getImages = (dom, selector) => {
    const nodeList = dom.window.document.querySelectorAll(selector)
    let array = []
    Array.prototype.slice.call(nodeList).forEach(img => {
        array.push(`https:${img.src.split('.png')[0]}.png`)
    })
    return array
}

const scrape = async (name, role) => {
    const championName = name.toLowerCase()
    const championRole = role.toLowerCase()

    const html = await axios.get(championPage(championName, championRole))
    const dom = new JSDOM(html.data)

    let data = {
        runes:{
            masteries:[],
            fragments:[]
        }
    }

    // img[src*="//opgg-static.akamaized.net/images/lol/item/"]
    let masteriesSelector = '.perk-page__item--active > div > img'
    let fragmentsSelector = '.fragment > div > img.active'
    data.runes.masteries = getImages(dom, masteriesSelector).slice(0,6)
    data.runes.fragments = getImages(dom, fragmentsSelector).slice(0,3)

    return data

}

module.exports = scrape
