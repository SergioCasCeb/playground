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
 * @file The `aas.js` takes care of the main functionality for the 
 * AAS AID feature within the console. This include initializing the editor,
 * connecting it to the local storage, as well as the main buttons within the AAS
 * feature such as json, yaml conversion and the download option.
 */

import { editor } from 'monaco-editor'
import { setFontSize, editorForm, fontSizeSlider } from './settings-menu'

/******************************************************************/
/*                    AAS functionality                       */
/******************************************************************/


/**
 * Initialize the monaco editor for the input format editor in the import feature, sets it to an empty value and
 * a default language of json. Also it connects the editor to the local storage to change 
 * the fontsize correspondingly
 */

const formatComment = {
    "Note": "Insert your Thing in your desired format here to convert it into a TD"
}

async function initFormatEditor() {
    window.inputFormatEditor = editor.create(document.getElementById('input-format-editor'), {
        value: JSON.stringify(formatComment, null, 2),
        language: "json",
        automaticLayout: true,
        readOnly: false,
        formatOnPaste: true,
        wordWrap: "on"
    })

    document.onload = setFontSize(window.inputFormatEditor)
    fontSizeSlider.addEventListener("input", () => {
        setFontSize(window.inputFormatEditor)
    })

    //Bind the reset button form the settings to the editor and assign the specified font size
    editorForm.addEventListener("reset", () => {
        setFontSize(window.inputFormatEditor)
    })
}

initFormatEditor()


/**
 * Initialize the monaco editor for the parameters editor in the import feature, sets it to an empty value and
 * a default language of json. Also it connects the editor to the local storage to change 
 * the fontsize correspondingly
 */

const parametersComment = {
    "Note": "Insert your parameters here"
}
async function initParametersEditor() {
    window.parametersEditor = editor.create(document.getElementById('parameters-editor'), {
        value: JSON.stringify(parametersComment, null, 2),
        language: "json",
        automaticLayout: true,
        readOnly: false,
        formatOnPaste: true,
        wordWrap: "on"
    })

    document.onload = setFontSize(window.parametersEditor)
    fontSizeSlider.addEventListener("input", () => {
        setFontSize(window.parametersEditor)
    })

    //Bind the reset button form the settings to the editor and assign the specified font size
    editorForm.addEventListener("reset", () => {
        setFontSize(window.parametersEditor)
    })
}

initParametersEditor()