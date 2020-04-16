// declare a variable name for the url in cookie
const COOKIE_NAME = '__vairiant'

/***
 * this ElementHandler responds to any incoming elemnt, 
 * which is to customize the response variant page.
 */
class ElementHandler {
  symbol = null
  element(element) {
    // Extra Credit
    // when finding an a tag (hyperlink), changes its destination to
    // Zican's LinkedIn page.  
    if (element.tagName === 'a') {
      element = element.setAttribute("href", "https://www.linkedin.com/in/zicanl/")
    }
  }

  comments(comment) {

  }

  text(text) {

    if (text.text.includes("Variant")) {
      // Change the title of webpage and the main title of the page
      // Variant X to Zican X
      this.symbol = text.text.split("Variant")[1][1];
      text = text.replace("Zican " + this.symbol)
    }

    if (text.text.includes("Return to cloudflare.com")) {
      // Change the text on the Hypterlink Button
      text = text.replace("Redirect to Zican's Linkedin Page")
    }

    if (text.text.includes("take home project!")) {
      // Change the text of description
      text = text.replace(`This is Zican's take home project submission ${this.symbol}`)
    }
  }
}

/**
 * This function will try to retrieve the variant page link
 * stored in the Cookie. If it can not find a cookie variable with
 * name COOKIE_NAME, null will be returned
 * @param {Request} request 
 * @param {string} name 
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('cookie')
  console.log(cookieString)
  if (cookieString) {
    let cookies = cookieString.split(";")
    cookies.forEach(str => {
      let cookieName = str.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = str.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

/**
 * This function will form the final response. It will fetch the variant
 * page from the url first, then, customize the values inside the response
 * by using HTMLRewriter() and ElementHandler(). Then, the url of the variant
 * page will be stored in the Cookie.
 * @param {string} redirect_url 
 */
async function formResponse(redirect_url) {
  let temp_response = await fetch(redirect_url)
  let final_response = new HTMLRewriter().on('*', new ElementHandler()).transform(temp_response)
  final_response.headers.append('Set-Cookie', `${COOKIE_NAME}=${redirect_url};path=/`)
  return final_response
}

/**
 * This function will fetch data from API and reads the 
 * response stream to completion and parses the response as json
 * @param {string} url 
 */
async function fetch_data(url) {
  let response = await fetch(url)
  let data = await response.json()
  return data;
}


/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = "https://cfw-takehome.developers.workers.dev/api/variants"

  const url_in_cookie = getCookie(request, COOKIE_NAME)

  if (url_in_cookie) {
    let response = await fetch(url_in_cookie);
    return new HTMLRewriter().on('*', new ElementHandler()).transform(response)
  }

  let data = await fetch_data(url)

  let num = Math.random()
  // for 50/50 customer splition
  if (num < 0.5) {
    return await formResponse(data['variants'][0])

  } else {
    return await formResponse(data['variants'][1])
  }

}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

