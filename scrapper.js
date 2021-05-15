const puppeteer = require('puppeteer')

const goToChampionPage = async (page, championName, championRole) => {
    if (championName == null) return

    switch(championRole) {
        case 'bot' || 'bottom' || 'bas' :
            await page.goto(`https://euw.op.gg/champion/${championName}/statistics/bot`)
            break
        case 'supp' || 'support' :
            await page.goto(`https://euw.op.gg/champion/${championName}/statistics/support`)
            break
        case 'mid' || 'middle' || 'midlane' :
            await page.goto(`https://euw.op.gg/champion/${championName}/statistics/mid`)
            break
        case 'jungle' || 'jung' :
            await page.goto(`https://euw.op.gg/champion/${championName}/statistics/jungle`)
            break
        case 'top' || 'toplane' : 
            await page.goto(`https://euw.op.gg/champion/${championName}/statistics/top`)
            break
        default :
            await page.goto(`https://euw.op.gg/champion/${championName}/statistics/`) 
    }
}

const acceptCookies = async (page) => {
    // find then click on accept cookies button
    const cookieButtonSelector = '[aria-label="J\'ACCEPTE"]'
    await page.waitForSelector(cookieButtonSelector)
    await page.click(cookieButtonSelector)
}

const screenshot = async (page, selector, path) => {
    await page.waitForSelector(selector)
    const element = await page.$(selector)
    await element.screenshot({path: path})
}

const scrape = async (name, role) => {
    const browser = await puppeteer.launch({
        headless:false
    })
    const page = await browser.newPage()

    const championName = name.toLowerCase()
    const championRole = role.toLowerCase()

    const skillsSelector = 'body > div.l-wrap.l-wrap--champion > div.l-container > div > div.tabWrap._recognized > div.l-champion-statistics-content.tabItems > div.tabItem.Content.championLayout-overview > div > div.l-champion-statistics-content__main > table.champion-overview__table.champion-overview__table--summonerspell > tbody:nth-child(5)'
    const stuffSelector = '[class="champion-overview__table"]'
    const runesSelector = 'body > div.l-wrap.l-wrap--champion > div.l-container > div > div.tabWrap._recognized > div.l-champion-statistics-content.tabItems > div.tabItem.Content.championLayout-overview > div > div.l-champion-statistics-content__main > div > table'

    goToChampionPage(page, championName, championRole)
    acceptCookies(page).then( async () => {
        screenshot(page, skillsSelector, 'screenshots/skills.png')
        await page.waitForTimeout(200)
        screenshot(page, stuffSelector, 'screenshots/stuff.png')
        await page.waitForTimeout(200)
        screenshot(page, runesSelector, 'screenshots/runes.png')
    }) 

}
module.exports = scrape