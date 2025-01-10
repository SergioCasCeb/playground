/* 
 *  Copyright (c) 2023 Contributors to the Eclipse Foundation
 *  
 *  See the NOTICE file(s) distributed with this work for additional
 *  information regarding copyright ownership.
 *  
 *  This program and the accompanying materials are made available under the
 *  terms of the Eclipse Public License v. 2.0 which is available at
 *  http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *  Document License (2015-05-13) which is available at
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document.
 *  
 *  SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 */


/**
 * @file The `import-menu.js` contains the main functionality
 * for the import menu, such as selecting multiple formats, providing multiple editors to
 * the user to paste their own TDs, as well as the necessary buttons to convert or close the menu.
 * In the future the option to also allow user to input files would could also prove to be useful.
 */

import { createIde, ideCount } from "./editor"
import { generateTDFromAAS } from './util'
export const importMenu = document.querySelector(".import-menu")
const closeImportMenu = document.querySelector(".import-menu-close svg")
const importMenuBtn = document.querySelector("#import-btn")
const importMenuContainer = document.querySelector(".import-menu__container")
const convertBtn = document.querySelector("#import-btn-convert")
const cancelBtn = document.querySelector("#import-btn-cancel")
const inputFormatOptions = document.querySelectorAll(".import-options input")
const errorMsg = document.querySelector(".error-msg-container")
const errorMsgBody = document.querySelector(".error-msg__body")
const errorMsgTitle = document.querySelector(".error-msg-title")
const closeErrorMsg = document.querySelector(".close-msg svg")

errorMsgTitle.textContent = ""
errorMsgBody.textContent = ""


/**
 * Closing the import menu when clicking on the close button
 */
closeImportMenu.addEventListener("click", () => {
    importMenu.classList.add("closed")
})

/**
 * Closing the import menu when clicking on the cancel button
 */
cancelBtn.addEventListener("click", () => {
    importMenu.classList.add("closed")
})

/**
 * Closing the error message when clicking on the close button and
 * deleting the previous text of the error message
 */
closeErrorMsg.addEventListener("click", () => { 
    errorMsg.classList.add("hidden")
    errorMsgTitle.textContent = ""
    errorMsgBody.textContent = ""
})

//Handle click outside the save menu
document.addEventListener('click', (e) => {
    if (!importMenuBtn.contains(e.target) && !importMenuContainer.contains(e.target) && !importMenu.classList.contains("closed")) {
        importMenu.classList.add("closed")
    }
})


/**
 * Open the import menu when clicking on the import button
 */
importMenuBtn.addEventListener("click", () => {
    importMenu.classList.remove("closed")
})


/**
 * Conversion of the selected format to a TD when clicking on the convert button
 */
convertBtn.addEventListener("click", () => {

    //Get selected format
    let selectedFormat = null
    inputFormatOptions.forEach(option => {
        option.checked ? selectedFormat = option.value : null
    })

    //Get editor content
    const inputContent = window.inputFormatEditor.getModel().getValue()
    const parametersContent = window.parametersEditor.getModel().getValue()

    if (inputContent === "") {
        errorMsg.classList.remove("hidden")
        errorMsgTitle.textContent = "Error: Input editor is empty"
    }
    else {
        try {
            const inputJSON = JSON.parse(inputContent)
            const parametersJSON = parametersContent === "" ? undefined : JSON.parse(parametersContent)

            //Handle conversion depending on the selected format
            switch (selectedFormat) {
                case 'tm':
                    //TODO: remove when the functionality has been added
                    console.log(selectedFormat)
                    break;
                case 'aas-aid': {
                    const generatedTD = generateTDFromAAS(inputJSON, parametersJSON)
                    createIde(++ideCount.ideNumber, JSON.parse(generatedTD))
                    importMenu.classList.add("closed")
                    break;
                }
                //TODO: Add more cases for other formats
                // case 'open-api':
                //     console.log("open api format");
                //     break;
                // case 'async-api':
                //     console.log("async api format");
                //     break;
                default:
                    break;
            }
        }
        catch (error) {
            errorMsg.classList.remove("hidden")
            errorMsgTitle.textContent = error
        }
    }
})
