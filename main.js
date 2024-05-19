'use strict';

import { Octokit } from "https://esm.sh/octokit?dts"
import GITHUB_TOKEN from "./env.js"

const octokit = new Octokit({
    auth: GITHUB_TOKEN
})

const title = document.getElementById("GUF")
let inputBox = document.getElementById("input-box")
const searchButton = document.getElementById("search-button")
let input = ""
const menus = document.querySelectorAll(".menu span")
let menu = "repository"
let results = [];
let rightResult = [];
let page = 1;
let pageSize = 24;
let totalPage = 0;
let firstPage = ""
let secondPage = ""
let thirdPage = ""
let fourthPage = ""
let fifthPage = ""

// arrow buttons
const firstPageButton = document.getElementById("first-page")
const prevPageButton = document.getElementById("prev-page")
const nextPageButton = document.getElementById("next-page")
const lastPageButton = document.getElementById("last-page")
// page buttons
// const pageButtons = document.getElementById("page-buttons")
const pageOne = document.getElementById("page-one")
const pageTwo = document.getElementById("page-two")
const pageThree = document.getElementById("page-three")
const pageFour = document.getElementById("page-four")
const pageFive = document.getElementById("page-five")

// if the circle button is clicked, get github's info
// circleButton.addEventListener("click", () => {
//     input = "github"
//     searchUsername()
// })
title.addEventListener("click", () => location.reload())
// get input value
searchButton.addEventListener("click", () => {
    input = inputBox.value
    inputBox.value = ""
    menu = "repository";
    page = 1;
    searchUsername()
})
// activate enter key 
inputBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
})

// get user's info
const searchUsername = async () => {
    try {
        // username search result
        const response = await octokit.request('GET /users/{username}', {
            username: input,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        // user's repository results
        const repoResponse = await octokit.request('GET /users/{username}/repos', {
            username: input,
            per_page: pageSize,
            page: 1,
            sort: "created",
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        results = response.data
        rightResult = repoResponse.data
        // move input area 
        const inputArea = document.getElementById("input-area")
        inputArea.style.cssText = "display: flex; justify-content: right; position: relative; top: 0px;"
        // delete message on the first screen
        // const delMessage = document.getElementById("message")
        // delMessage.style.cssText = 'display: none'
        // show right section
        const showMenus = document.getElementById("right")
        showMenus.style.cssText = 'display: inline; background-color: rgb(240, 240, 240); border: 1px solid black;box-shadow: black 7px 7px 0;';
        // make repository menu text selected
        const repository = document.getElementById("repository")
        const followers = document.getElementById("followers")
        const following = document.getElementById("following")
        repository.setAttribute("class", "menu col-4 selected")
        followers.setAttribute("class", "menu col-4")
        following.setAttribute("class", "menu col-4")
        // both section render
        leftRender();
        rightRender();

    } catch (error) {
        alert(error.message)
        location.reload();
    }
}


// repository, followers, following click event
menus.forEach((tab) => tab.addEventListener("click", (event) => {
    menu = event.target.textContent
    switchMenu();
})
)
// when a menu is clicked
const switchMenu = () => {
    page = 1;
    const repository = document.getElementById("repository")
    const followers = document.getElementById("followers")
    const following = document.getElementById("following")
    if (menu === "repository") {
        repository.setAttribute("class", "menu col-4 selected")
        followers.setAttribute("class", "menu col-4")
        following.setAttribute("class", "menu col-4")
    } else if (menu === "followers") {
        repository.setAttribute("class", "menu col-4")
        followers.setAttribute("class", "menu col-4 selected")
        following.setAttribute("class", "menu col-4")
    } else if (menu === "following") {
        repository.setAttribute("class", "menu col-4")
        followers.setAttribute("class", "menu col-4")
        following.setAttribute("class", "menu col-4 selected")
    }
    updateResult();
}

const updateResult = async () => {
    try {
        if (menu === "repository") {
            const repoResponse = await octokit.request('GET /users/{username}/repos', {
                username: input,
                per_page: pageSize,
                page: page,
                sort: "created",
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            rightResult = repoResponse.data
        } else if (menu === "followers") {
            const followersResponse = await octokit.request('GET /users/{username}/followers', {
                username: input,
                per_page: pageSize,
                page: page,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            rightResult = followersResponse.data
        } else if (menu === "following") {
            const followingResponse = await octokit.request('GET /users/{username}/following', {
                username: input,
                per_page: pageSize,
                page: page,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            rightResult = followingResponse.data
        }
        rightRender(), paginationRender()
    } catch (error) {
        alert(error.message)
        location.reload();
    }
}

// left section rendering
// no info provided, show blank
const leftRender = () => {
    const usernameHTML = `<a href="${results.html_url}">${results.login}</a>`
    document.querySelector(".username").innerHTML = usernameHTML
    const leftHTML = `
        <section class="main-info">
            <img
            class="avatar"
            src="${results.avatar_url}"
            />
            <p class="name">${results.name == null ? results.login : results.name}</p>
            ${results.bio == null ? "" : `<p class="bio">${results.bio}</p>`}
        </section>
        <!-- repos, followers, following -->
        <section>
            <div class="numbers">
                <div>
                    <p class="number">
                    ${results.public_repos}
                    </p>
                    <p>repos</p>
                </div>
                <div>
                    <p class="number">
                    ${results.followers > 1000000 ? Math.floor(results.followers / 100000) / 10 : results.followers > 10000 ? Math.floor(results.followers / 100) / 10 : results.followers}${results.followers > 1000000 ? "M" : results.followers > 10000 ? "K" : ""}
                    </p>
                    <p>followers</p>
                </div>
                <div>
                    <p class="number">
                    ${results.following > 1000000 ? Math.floor(results.following / 100000) / 10 : results.following > 10000 ? Math.floor(results.following / 100) / 10 : results.following}${results.following > 1000000 ? "M" : results.following > 10000 ? "K" : ""}
                    </p>
                    <p>following</p>
                </div>
            </div>
        </section>
        <!-- extra details -->
        <section class="extra-details section">
            <div class="extra-top">
                <p>joined ${moment(results.created_at).fromNow()}</p>
                ${results.location == null ? "" : `<p><svg aria-hidden="true" height="14" viewBox="0 0 16 16" version="1.1" width="14" fill="rgb(99, 99, 99)" data-view-component="true" class="octicon octicon-location flex-shrink-0">
                <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"></path>
            </svg> ${results.location}</p>`}
            </div>
            <div class="extra-bottom">
                ${results.company == null ? "" : `<p><svg class="octicon octicon-organization" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="rgb(77, 77, 77)"><path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"></path></svg> ${results.company}</p>`}
                ${results.email == null ? "" : `<p><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-mail flex-shrink-0 v-align-middle" fill="rgb(77, 77, 77)">
                <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"></path>
            </svg> ${results.email}</p>`}
                ${results.blog == "" ? "" : `<p class="blog"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-link flex-shrink-0" fill="rgb(77, 77, 77)">
                <path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path>
            </svg> <a href="${results.blog}">${results.blog}</a></p>`}
                ${results.twitter_username == null ? "" : `<p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(77, 77, 77)" role="img" aria-labelledby="a750zccjdrjh2raoa8fa63f5fhw23eg2" class="octicon flex-shrink-0"><title id="a750zccjdrjh2raoa8fa63f5fhw23eg2">X</title>
                <g clip-path="url(#clip0_1668_3024)">
                <path d="M9.52217 6.77143L15.4785 0H14.0671L8.89516 5.87954L4.76437 0H0L6.24656 8.8909L0 15.9918H1.41155L6.87321 9.78279L11.2356 15.9918H16L9.52183 6.77143H9.52217ZM7.58887 8.96923L6.95596 8.0839L1.92015 1.03921H4.0882L8.15216 6.7245L8.78507 7.60983L14.0677 14.9998H11.8997L7.58887 8.96957V8.96923Z" fill="currentColor"></path>
                </g>
                <defs>
                <clipPath id="clip0_1668_3024">
                <rect width="16" height="16" fill="white"></rect>
                </clipPath>
                </defs>
                </svg> ${results.twitter_username}</p>`}
            </div>
        </section>`
    document.querySelector(".left").innerHTML = leftHTML;
}
//right section rendering
// no results? show 0 result
const rightRender = () => {
    let rightHTML = ``
    if (menu === "repository" || menu === "") {
        if (rightResult.length == 0) {
            rightHTML = `<div class="no-results">0 repository</div>`
        } else {
            for (let i = 0; i < rightResult.length; i++) {
                rightHTML += `<div class="repo col-xl-4 col-lg-6 col-md-4 col-sm-6 col-12">
                <div class="repo-top"><p class="repo-name"><a href="${rightResult[i].html_url}">${rightResult[i].name}</a></p>
                ${rightResult[i].description == null ? "" : `<p class="repo-desc">${rightResult[i].description.length > 100 ? rightResult[i].description.replaceAll(/</g, "&lt;").substring(0, 100) + "..." : rightResult[i].description.replaceAll(/</g, "&lt;")}</p>`}
                </div>
                <div class="repo-bottom">
                ${rightResult[i].language == null ? "" : `<p class="repo-lang">${rightResult[i].language}</p>`}
                <p>${moment(rightResult[i].created_at).fromNow()}</p></div>
                </div>`
            }
        }
    } else if (menu === "followers") {
        if (rightResult.length == 0) {
            rightHTML = `<div class="no-results">0 follower</div>`
        } else {
            for (let i = 0; i < rightResult.length; i++) {
                rightHTML += `<div class="follow col-md-3 col-4">
                <a href="${rightResult[i].html_url}"><img
                    class="follow-avatar"
                    src="${rightResult[i].avatar_url}"
                />
                <p class="follow-username">${rightResult[i].login}</p>
                </div></a>`
            }
        }
    } else if (menu === "following") {
        if (rightResult.length == 0) {
            rightHTML = `<div class="no-results">0 following</div>`
        } else {
            for (let i = 0; i < rightResult.length; i++) {
                rightHTML += `<div class="follow col-md-3 col-4">
                <a href="${rightResult[i].html_url}"><img
                    class="follow-avatar"
                    src="${rightResult[i].avatar_url}"
                />
                <p class="follow-username">${rightResult[i].login}</p>
                </div></a>`
            }
        }
    }
    document.querySelector(".under-menu").innerHTML = rightHTML;
    paginationRender();

}

// pagination
const paginationRender = () => {
    let totalResults = 0;
    if (menu === "repository") {
        totalResults = results.public_repos
    } else if (menu === "followers") {
        totalResults = results.followers
    } else if (menu === "following") {
        totalResults = results.following
    }

    const groupSize = 5
    totalPage = Math.ceil(totalResults / pageSize)
    const pageGroup = Math.ceil(page / groupSize)
    //
    const lastPage = (totalPage < (pageGroup * groupSize) || totalPage < groupSize)
        ? totalPage : (pageGroup * groupSize)
    firstPage = pageGroup != 1 && totalPage < pageGroup * groupSize
        ? totalPage - groupSize + 1
        : (pageGroup - 1) * groupSize + 1
    secondPage = firstPage + 1
    thirdPage = firstPage + 2
    fourthPage = firstPage + 3
    fifthPage = firstPage + 4
    //
    const allPages = [firstPage, secondPage, thirdPage, fourthPage, fifthPage]
    const allButtons = [pageOne, pageTwo, pageThree, pageFour, pageFive]
    if (totalResults <= 24) {
        firstPageButton.style.cssText = "display:none"
        prevPageButton.style.cssText = "display:none"
        allButtons.forEach((button) => button.style.cssText = "display:none")
        nextPageButton.style.cssText = "display:none"
        lastPageButton.style.cssText = "display:none"
    } else {
        allButtons.forEach((button) => button.style.cssText = "display:flex; justify-content:center")
        pageOne.innerHTML = firstPage
        pageTwo.innerHTML = secondPage
        pageThree.innerHTML = thirdPage
        pageFour.innerHTML = fourthPage
        pageFive.innerHTML = fifthPage
        // when total pages <= 5
        for (let i = 0; i < allPages.length; i++) {
            if (allPages[i] === totalPage) {
                for (let j = i + 1; j < allButtons.length; j++) {
                    allButtons[j].style.cssText = "display:none"
                }
            }
        }
        // on the first page, hide left arrow buttons
        if (page == 1) {
            firstPageButton.style.cssText = "visibility:hidden"
            prevPageButton.style.cssText = "visibility:hidden"
        } else {
            firstPageButton.style.cssText = "visibility: visible"
            prevPageButton.style.cssText = "visibility: visible"
        }
        // on the last page, hide right arrow buttons
        if (page == totalPage) {
            nextPageButton.style.cssText = "visibility:hidden"
            lastPageButton.style.cssText = "visibility:hidden"
        } else {
            nextPageButton.style.cssText = "visibility: visible"
            lastPageButton.style.cssText = "visibility: visible"
        }
    }

    // mark active page
    if (page == firstPage) {
        pageOne.setAttribute("class", "page active")
    } else {
        pageOne.setAttribute("class", "page")
    }
    if (page == secondPage) {
        pageTwo.setAttribute("class", "page active")
    } else {
        pageTwo.setAttribute("class", "page")
    }
    if (page == thirdPage) {
        pageThree.setAttribute("class", "page active")
    } else {
        pageThree.setAttribute("class", "page")
    }
    if (page == fourthPage) {
        pageFour.setAttribute("class", "page active")
    } else {
        pageFour.setAttribute("class", "page")
    }
    if (page == fifthPage) {
        pageFive.setAttribute("class", "page active")
    } else {
        pageFive.setAttribute("class", "page")
    }
}


// when arrow buttons are clicked
firstPageButton.addEventListener("click", () => {
    if (page != 1) {
        page = 1
        updateResult();
    }
})
prevPageButton.addEventListener("click", () => {
    if (page != 1) {
        page -= 1
        updateResult();
    }
})
nextPageButton.addEventListener("click", () => {
    if (page != totalPage) {
        page += 1
        updateResult();
    }
})
lastPageButton.addEventListener("click", () => {
    if (page != totalPage) {
        page = totalPage
        updateResult();
    }
})
// when page buttons are clicked
pageOne.addEventListener("click", () => {
    page = firstPage
    updateResult();
})
pageTwo.addEventListener("click", () => {
    page = secondPage
    updateResult();
})
pageThree.addEventListener("click", () => {
    page = thirdPage
    updateResult();
})
pageFour.addEventListener("click", () => {
    page = fourthPage
    updateResult();
})
pageFive.addEventListener("click", () => {
    page = fifthPage
    updateResult();
})
