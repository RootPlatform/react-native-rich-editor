function getContentCSS() {
  /*img {max-width: 98%;margin-left:auto;margin-right:auto;display: block;}*/
  return `
    <style>
        video {max-width: 98%;margin-left:auto;margin-right:auto;display: block;}
        img {max-width: 98%;vertical-align: middle;}
        table {width: 100% !important;}
        table td {width: inherit;}
        table span { font-size: 12px !important; }
        .x-todo li {list-style:none;}
        .x-todo-box {position: relative; left: -24px;}
        .x-todo-box input{position: absolute;}
        blockquote{border-left: 6px solid #ddd;padding: 5px 0 5px 10px;margin: 15px 0 15px 15px;}
        hr{display: block;height: 0; border: 0;border-top: 1px solid #ccc; margin: 15px 0; padding: 0;}
        pre{padding: 10px 5px 10px 10px;margin: 15px 0;display: block;line-height: 18px;background: #F0F0F0;border-radius: 6px;font-size: 13px; font-family: 'monaco', 'Consolas', "Liberation Mono", Courier, monospace; word-break: break-all; word-wrap: break-word;overflow-x: auto;}
        pre code {display: block;font-size: inherit;white-space: pre-wrap;color: inherit;}
    </style>
    `;
}

function createHTML(options = {}) {
  const {
    backgroundColor = '#FFF',
    color = '#000033',
    caretColor = '',
    placeholderColor = '#a9a9a9',
    contentCSSText = '',
    cssText = '',
    initialCSSText = '',
    pasteAsPlainText = false,
    pasteListener = false,
    keyDownListener = false,
    keyUpListener = false,
    inputListener = false,
    autoCapitalize = 'off',
    enterKeyHint = '',
    initialFocus = false,
    autoCorrect = false,
    defaultParagraphSeparator = 'div',
    // When first gaining focus, the cursor moves to the end of the text
    firstFocusEnd = true,
    useContainer = true,
    styleWithCSS = false,
    useCharacter = true,
    defaultHttps = true,
  } = options;
  //ERROR: HTML height not 100%;
  return `
<!DOCTYPE html>
<html>
<head>
    <title>RN Rich Text Editor</title>
    <meta name="viewport" content="user-scalable=1.0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
    <style>
        ${initialCSSText}
        * {outline: 0px solid transparent;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-touch-callout: none;box-sizing: border-box;}
        html, body { margin: 0; padding: 0;font-family: Arial, Helvetica, sans-serif; font-size:1em; height: 100%}
        body { overflow-y: hidden; -webkit-overflow-scrolling: touch;background-color: ${backgroundColor};caret-color: ${caretColor};}
        .content {font-family: Arial, Helvetica, sans-serif;color: ${color}; width: 100%;${
    !useContainer ? 'height:100%;' : ''
  }-webkit-overflow-scrolling: touch;padding-left: 0;padding-right: 0;}
        .pell { height: 100%;} .pell-content { outline: 0; overflow-y: auto;padding: 10px;height: 100%;${contentCSSText}}
    </style>
    <style>
        [placeholder]:empty:before { content: attr(placeholder); color: ${placeholderColor}; font-size: 16px;}
        [placeholder]:empty:focus:before { content: attr(placeholder);color: ${placeholderColor};display:block; font-size: 16px;}
    </style>
    ${getContentCSS()}
    <style>${cssText}</style>
</head>
<body>
<div class="content"><div id="editor" class="pell"/></div>
<script>
    var __DEV__ = !!${window.__DEV__};
    var _ = (function (exports) {
        var anchorNode, focusNode, anchorOffset, focusOffset, _focusCollapse = false, cNode;
        var _log = console.log;
        var placeholderColor = '${placeholderColor}';
        var _randomID = 99;
        var generateId = function (){
            return "auto_" + (++ _randomID);
        }

        var body = document.body, docEle = document.documentElement;
        var defaultParagraphSeparatorString = 'defaultParagraphSeparator';
        var formatBlock = 'formatBlock';
        var editor = null, editorFoucs = false, o_height = 0, compositionStatus = 0, paragraphStatus = 0, enterStatus = 0;
        function addEventListener(parent, type, listener) {
            return parent.addEventListener(type, listener);
        };
        function appendChild(parent, child) {
            return parent.appendChild(child);
        };
        function createElement(tag) {
            return document.createElement(tag);
        };
        function queryCommandState(command) {
            return document.queryCommandState(command);
        };
        function queryCommandValue(command) {
            return document.queryCommandValue(command);
        };
        function query(command){
            return document.querySelector(command);
        }
        function querys(command){
            return document.querySelectorAll(command);
        }

        function exec(command) {
            var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return document.execCommand(command, false, value);
        };

        function asyncExec(command){
            var args = Array.prototype.slice.call(arguments);
            setTimeout(function(){
                exec.apply(null, args);
            }, 0);
        }

        function _postMessage(data){
            exports.window.postMessage(JSON.stringify(data));
        }
        function postAction(data){
            editor.content.contentEditable === 'true' && _postMessage(data);
        };

        exports.isRN && (
            console.log = function (){
                var data = Array.prototype.slice.call(arguments);
                __DEV__ && _log.apply(null, data);
                __DEV__ && postAction({type: 'LOG', data});
            }
        )

        function formatParagraph(async){
            (async ? asyncExec: exec)(formatBlock, '<' + editor.paragraphSeparator + '>' );
        }

        function getNodeByClass(node, className){
            return node ? (node.nodeType === Node.ELEMENT_NODE && node.classList.contains(className)? node : getNodeByClass(node.parentNode, className)): node;
        }

        function getNodeByName(node, name){
            return node? (node.nodeType === Node.ELEMENT_NODE && node.nodeName === name? node: getNodeByName(node.parentNode, name)): node;
        }

        function setCollapse(node){
            var selection = window.getSelection();
            selection.selectAllChildren(node);
            selection.collapseToEnd();
        }

        function checkboxNode(node){
            return getNodeByClass(node, 'x-todo');
        }

        function execCheckboxList (node, html){
            var html = createCheckbox(node ? node.innerHTML: '');
            var HTML = "<ol class='x-todo'><li>"+ html +"</li></ol>"
            var foNode;
            if (node){
                node.innerHTML = HTML;
                foNode = node.firstChild;
            } else {
                exec("insertHTML", HTML);
            }

            foNode && setTimeout(function (){
                setCollapse(foNode);
            });
        }

        var _checkboxFlag = 0; // 1 = add checkbox; 2 = cancel checkbox
        function cancelCheckboxList(box){
            _checkboxFlag = 2;
            exec("insertOrderedList");
            setCollapse(box);
        }

        function createCheckbox(end){
            var html = '<span contenteditable="false" class="x-todo-box"><input type="checkbox"></span>';
            if (end && typeof end !== 'boolean'){
                html += end;
            } else if(end !== false){
                html += "<br/>"
            }
            return html;
        }

        function insertCheckbox (node){
            var li = getNodeByName(node, 'LI');
            li.insertBefore(document.createRange().createContextualFragment(createCheckbox(false)), li.firstChild);
            setCollapse(node);
        }

        function getCheckbox (node){
            return getNodeByClass(node, "x-todo-box");
        }

        function saveSelection(){
            var sel = window.getSelection();
            currentSelection = sel;
            anchorNode = sel.anchorNode;
            anchorOffset = sel.anchorOffset;
            focusNode = sel.focusNode;
            focusOffset = sel.focusOffset;
        }

        function focusCurrent(){
            editor.content.focus();
            try {
                var selection = window.getSelection();
                if (anchorNode){
                    if (anchorNode !== selection.anchorNode && !selection.containsNode(anchorNode)){
                        _focusCollapse = true;
                        selection.collapse(anchorNode, anchorOffset);
                    }
                } else if(${firstFocusEnd} && !_focusCollapse ){
                    _focusCollapse = true;
                    selection.selectAllChildren(editor.content);
                    selection.collapseToEnd();
                }
            } catch(e){
                console.log(e)
            }
        }

        var _keyDown = false;
        function handleChange (event){
            var node = anchorNode;
            Actions.UPDATE_HEIGHT();
            Actions.UPDATE_OFFSET_Y();
            if (_keyDown){
                if(_checkboxFlag === 1 && checkboxNode(node)){
                    _checkboxFlag = 0;
                    var sib = node.previousSibling;
                    if (!sib || sib.childNodes.length > 1){
                        insertCheckbox(node);
                    }
                } else if(_checkboxFlag === 2){
                    _checkboxFlag = 0;
                    var sp = createElement(editor.paragraphSeparator);
                    var br = createElement('br');
                    sp.appendChild(br);
                    setTimeout(function (){
                        if (!node.classList.contains("x-todo-box")){
                            node = node.parentNode.previousSibling;
                        }
                        node.parentNode.replaceChild(sp, node);
                        setCollapse(sp);
                    });
                }
            }
        }

        function adjustNestedElements() {
            // adjust ul/ol if we use p separator
            // since nesting is not valid for p
            if (editor.paragraphSeparator == 'p') {
                var selection = window.getSelection();

                let lists = document.querySelectorAll("ol, ul");
                for (let i = 0; i < lists.length; i++) {
                    let ele = lists[i];
                    let parentNode = ele.parentNode;
                    if (parentNode.tagName === 'P' && parentNode.lastChild === parentNode.firstChild) {
                        parentNode.insertAdjacentElement('beforebegin', ele);
                        parentNode.remove()
                    }
                }

                selection.collapse(anchorNode, anchorOffset);
            }
        }
        function postContentUpdate() {
           // Alert the component that the content has changed
            Actions.POST_CONTENT_UPDATE();

            // Recalculate the height of the editor
            Actions.UPDATE_HEIGHT();
            Actions.UPDATE_OFFSET_Y();
        }

        /**
         * Unique markers for selection boundaries. These are used to track the cursor position through parsing.
         * These string based boundaries are useful for persisting heavy dom manipulations and string based updates.
         */
        const timestamp = Date.now();
        const MARKER_START = "@@----SELECTION-START-" + timestamp + "----@@";
        const MARKER_END = "@@----SELECTION-END-" + timestamp + "----@@";

        const MENTION_MARKER = "@@----MENTION" + timestamp + "----@@";

        /**
         * Inserts MARKER_START and MARKER_END at the selection boundaries in the editor content to track cursor position.
         * Note: Prior to insertion, we remove the active selection ranges, so the user won't potentially see a highlight of these tokens.
         */
        function insertMarkerTokens() {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            selection.removeAllRanges();

            // If the range is collapsed, insert both markers at the cursor position.
            if (range.collapsed) {
                range.insertNode(document.createTextNode(MARKER_END));
                range.insertNode(document.createTextNode(MARKER_START));
            // If the range is not collapsed, insert markers at the start and end boundaries.
            } else {
                // Clone the original range so we can manipulate each boundary independently.
                const startRange = range.cloneRange();
                const endRange = range.cloneRange();

                // Insert END at the end boundary
                endRange.collapse(false);
                endRange.insertNode(document.createTextNode(MARKER_END));

                // Insert START at the start boundary
                startRange.collapse(true);
                startRange.insertNode(document.createTextNode(MARKER_START));
            }
        }

         /**
         * Determine the locations of the marker tokens in the editor
         * Returns the node and offset of the start and end markers, if both exist
         * Otherwise, returns null
         */
        function findMarkerTokensAndPlaceRanges(element) {
            let startNode = null;
            let startOffset = null;
            let endNode = null;
            let endOffset = null;

            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

            while (walker.nextNode()) {
                const node = walker.currentNode;
                const text = node.nodeValue;

                // Look for MARKER_START
                const startIndex = text.indexOf(MARKER_START);
                if (startIndex !== -1) {
                    startNode = node;
                    // selection start offset is exactly where the token begins
                    startOffset = startIndex;

                    // remove the MARKER_START token
                    node.nodeValue = text.slice(0, startIndex) + text.slice(startIndex + MARKER_START.length);
                }

                // Look for MARKER_END
                const newText = node.nodeValue;
                const endIndex = newText.indexOf(MARKER_END);
                if (endIndex !== -1) {
                    endNode = node;
                    endOffset = endIndex;

                    // remove the MARKER_END token
                    endNode.nodeValue = newText.slice(0, endIndex) + newText.slice(endIndex + MARKER_END.length);
                    break;
                }
            }

            // Restore cursor position
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);

            // Remove active selection ranges
            selection.removeAllRanges();
            // Add the new range to selection
            selection.addRange(range);
        }

        function stripHTMLAndFlatten(element) {
            let changed = true;
            // Flatten until no changes are made
            while (changed) {
                changed = flattenOnePass(element);
            }
        }

        function isMention(element) {
            return element.tagName === 'SPAN' && element.className.startsWith('mention');
        }

        function isMarkdownSyntax(element) {
            return element.tagName === 'SPAN' && element.className === 'markdown-tag';
        }

        /*
        * Single pass that flattens current markup.
        * Returns true if it flattened something, meaning we might need another pass.
        * Preserve div and br elements.
        * I've found this is the best way to preserve line break context. It's best to rely on built in contenteditable behavior for managing new lines.
        */
        function flattenOnePass(element) {
            let child = element.firstChild;
            let didChange = false;
            const ALLOWED_TAGS = ["DIV", "BR"];

            while (child) {
                const next = child.nextSibling;
                if (child.nodeType === Node.ELEMENT_NODE) {
                const tagName = child.nodeName.toUpperCase();

                if (!ALLOWED_TAGS.includes(tagName) && !isMention(child)) {
                    // Flatten: move its children up, remove the node
                    didChange = true;
                    while (child.firstChild) {
                    element.insertBefore(child.firstChild, child);
                    }
                    element.removeChild(child);
                } else {
                    // Recurse into allowed tags
                    if (flattenOnePass(child)) didChange = true;
                }
                }
                child = next;
            }
            return didChange;
        }

        /**
        * Apply markdown syntax to the editor content
        */
        function applyMarkdownSyntax(syntax) {
            return '<span class="markdown-tag">' + syntax + '</span>'
        }

        /**
         *  Invalidate match solely on selection markers.
         */
        function isMatchOnSelectionMarkers(text) {
            return text === MARKER_START + MARKER_END;
        }

        const mentionRegex = /<span class="mention[^>]*>.*?<\\/span>/g;
        function insertMentionMarkers(tempDiv) {
            const mentionPlaceholders = [];
            const updatedHtml = tempDiv.innerHTML.replace(mentionRegex, match => {
                mentionPlaceholders.push(match);
                return MENTION_MARKER;
            });
            return { updatedHtml, mentionPlaceholders };
        }

        function restoreMentionSpans(html, mentionPlaceholders) {
            let currentIndex = 0;
            return html.replace(new RegExp(MENTION_MARKER, 'g'), () => {
                return mentionPlaceholders[currentIndex++];
            });
        }

        /**
        * String parsing function to add markdown elements to the editor content
        */
        const TEXT_DECORATION_REGEX =  /(\\*\\*\\*|___)(?!\\1)(.*?)\\1|(\\*\\*|__)(?!\\3)(.*?)\\3|(\\*|_)(?!\\5)(.*?)\\5|(~~)(?!\\7)(.*?)\\7/g;
        function parseTextDecorationFromMarkdown(html) {
            return html.replace(MARKDOWN_SYNTAX_REGEX, function(
                match, boldItalic, biContent, bold, bContent, italic, iContent, strike, sContent
            ) {
                if (boldItalic && biContent && !isMatchOnSelectionMarkers(biContent)) {
                return applyMarkdownSyntax(boldItalic) +
                    '<b><i>' + biContent + '</i></b>' +
                    applyMarkdownSyntax(boldItalic);
                } else if (bold && bContent && !isMatchOnSelectionMarkers(bContent)) {
                return applyMarkdownSyntax(bold) +
                    '<b>' + bContent + '</b>' +
                    applyMarkdownSyntax(bold);
                } else if (italic && iContent && !isMatchOnSelectionMarkers(iContent)) {
                return applyMarkdownSyntax(italic) +
                    '<i>' + iContent + '</i>' +
                    applyMarkdownSyntax(italic);
                } else if (strike && sContent && !isMatchOnSelectionMarkers(sContent)) {
                return applyMarkdownSyntax(strike) +
                    '<s>' + sContent + '</s>' +
                    applyMarkdownSyntax(strike);
                }
                return match;
            });
        }

        /**
         * Parses mentions in a markdown content string and returns a string with mentions wrapped in span elements.
        */
        const MENTION_MARKDOWN_REGEX = /\\[\\s*([@#])([^\\]]+)\\]\\((\\/\\/(role|user|channel)\\/([A-Za-z0-9_\\-]+))\\)/g;
        function parseMentionsFromMarkdown(tempDiv) {
          return tempDiv.innerHTML.replace(
            MENTION_MARKDOWN_REGEX,
            (_match, symbol, mentionText, fullUrl, mentionType, mentionId) => {
              const mentionClass = "mention-" + mentionType;

              return '<span class="' + mentionClass + '" data-mention-url="' + fullUrl + '">' +
                  symbol + mentionText +
                '</span>'
            }
          );
        }


        /**
        * Parse the editor content and apply markdown syntax
        */
       function parseMarkdown() {
            const editorContent = editor.content;

            // Insert marker tokens at the current selection
            insertMarkerTokens();

            // Create a temporary div
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = editorContent.innerHTML;

            // Flatten all elements leaving only allowed <div>, <br>, and text nodes
            stripHTMLAndFlatten(tempDiv);

            // Parse mentions from markdown
            const parsedMentions = parseMentionsFromMarkdown(tempDiv);
            tempDiv.innerHTML = parsedMentions;

            // insert mention markers
            const { updatedHtml, mentionPlaceholders } = insertMentionMarkers(tempDiv);

            // Apply markdown styling
            const parsedHTML = parseTextDecorationFromMarkdown(updatedHtml);

            // Restore mention spans
            const finalHTML = restoreMentionSpans(parsedHTML, mentionPlaceholders);

            // Replace editor content with parsed HTML
            editorContent.innerHTML = finalHTML;

            // Find the marker tokens in the updated content
            const markerPositions = findMarkerTokensAndPlaceRanges(editorContent);
        }

        function getSurroundingTextFromSelection() {
            const selection = window.getSelection();

            // exit if no selection
            if (!selection || selection.rangeCount === 0) {
                return { textBeforeCursor: "", textAfterCursor: "" };
            }

            const range = selection.getRangeAt(0);

            // exit if the range is not a text node
            if (range.startContainer.nodeType !== Node.TEXT_NODE) {
               return { textBeforeCursor: "", textAfterCursor: "" };
            }

            const textNode = range.startContainer;
            const text = textNode.textContent;

            const startOffset = range.startOffset;
            const endOffset = range.endOffset; // Handles the active selection length

            let textBeforeCursor = "";
            let textAfterCursor = "";

            // Helper function to check if a character should stop the traversal
            function isStopCharacter(char) {
                return !char.trim() || char === "\\s+" || char === "*" || char === "\`" || char === "~";
            }

            // Look backward from the start of the selection
            for (let i = startOffset - 1; i >= 0; i--) {
                if (isStopCharacter(text[i])) {
                    break;
                }
                textBeforeCursor = text[i] + textBeforeCursor;
            }

            // Look forward from the end of the selection
            for (let i = endOffset; i < text.length; i++) {
                if (isStopCharacter(text[i])) {
                    break;
                }
                textAfterCursor += text[i];
            }

            return { textBeforeCursor, textAfterCursor };
        }

        // Define the markers for different Markdown styles.
        const MARKDOWN_SYNTAX = {
            italic: '*',
            bold: '**',
            strikeThrough: '~~',
            code: '\`'
        };

        /**
         * Toggle markdown function for bold, italic, etc.
         * Inserts marker start and end around selection, then
         * Flatten the content
         * Determine whether to insert or remove markdown syntax
         * Run function to add back markdown elements
         * Place cursor back in the right position with the markers
         */
        function toggleMarkdown(markdownType) {
            const editorContent = editor.content;

            const markdownSyntax = MARKDOWN_SYNTAX[markdownType];
            if (!markdownSyntax) {
                console.warn("Unknown markdown markdownType: " + markdownType);
                return;
            }

            const selection = window.getSelection();
            const selectedText = selection.toString();
            // if no cursor in the document, return
            if (!selection.rangeCount) return;

            let textBeforeCursor = "";
            let textAfterCursor = "";
            const range = selection.getRangeAt(0);

            // bail out of toggle if either the start or end of the selection is within a mention
            if (range.startContainer && range.endContainer && (isMention(range.startContainer.parentNode) || isMention(range.endContainer.parentNode))) {
                return;
            }

            // With a collapsed range, detect the text before and after the selection to see if the markdown syntax is already present
            if (range.isCollapsed) {
                const surroundingText = getSurroundingTextFromSelection();
                textBeforeCursor = surroundingText.textBeforeCursor;
                textAfterCursor = surroundingText.textAfterCursor;
            }

            // insert selection tokens to track the selection position through parsing.
            insertMarkerTokens();

            // Create a temporary div
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = editorContent.innerHTML;

            // flatten the content for parsing, this helps handle wider selection ranges
            stripHTMLAndFlatten(tempDiv);

            // Find the markers in the content, the index is the start of the marker token in the string
            const markerStartIndex = tempDiv.innerHTML.indexOf(MARKER_START);
            const markerEndIndex = tempDiv.innerHTML.indexOf(MARKER_END);

            const previousSyntaxStart = markerStartIndex - markdownSyntax.length - textBeforeCursor.length;

            const nextSyntaxStart = markerEndIndex + MARKER_END.length + textAfterCursor.length;
            const nextSyntaxEnd = nextSyntaxStart + markdownSyntax.length

            // Determine if the text before and after the selection is the markdown syntax
            const isPreviousTextASyntaxMatch = tempDiv.innerHTML.slice(previousSyntaxStart, markerStartIndex - textBeforeCursor.length) === markdownSyntax;
            const isNextTextASyntaxMatch = tempDiv.innerHTML.slice(nextSyntaxStart, nextSyntaxEnd) === markdownSyntax;

            let updatedText;
            if (isPreviousTextASyntaxMatch && isNextTextASyntaxMatch) {
                // Remove the syntax
                const textBeforeSyntax = tempDiv.innerHTML.slice(0, previousSyntaxStart);
                const innerText = tempDiv.innerHTML.slice(markerStartIndex - textBeforeCursor.length, markerEndIndex + MARKER_END.length + textAfterCursor.length)
                const textAfterSyntax = tempDiv.innerHTML.slice(nextSyntaxEnd);
                updatedText = textBeforeSyntax + innerText + textAfterSyntax;
            } else {
                // Add the syntax
                const textBeforeSyntax = tempDiv.innerHTML.slice(0, markerStartIndex - textBeforeCursor.length);
                const innerText = tempDiv.innerHTML.slice(markerStartIndex - textBeforeCursor.length, markerEndIndex + MARKER_END.length + textAfterCursor.length)
                const textAfterSyntax = tempDiv.innerHTML.slice(nextSyntaxStart);
                console.log('add syntax', textBeforeSyntax, innerText, textAfterSyntax)
                updatedText = textBeforeSyntax + markdownSyntax + innerText + markdownSyntax + textAfterSyntax;
                console.log('updatedText', updatedText)
            }

            // Update the editor content
            tempDiv.innerHTML = updatedText;

             // insert mention markers
            const { updatedHtml, mentionPlaceholders } = insertMentionMarkers(tempDiv);

            // Parse string to add back markdown syntax
            const parsedHTML = parseTextDecorationFromMarkdown(updatedHtml);

            // Restore mention spans
            const finalHTML = restoreMentionSpans(parsedHTML, mentionPlaceholders);

            // Update the editor content
            editorContent.innerHTML = finalHTML;

            // Determine marker locations in the new content
            const markerPositions = findMarkerTokensAndPlaceRanges(editorContent);

            postContentUpdate();
        }

        /**
         * Given a node and offset, adjust the boundary to ensure the cursor is placed correctly
        */
        function adjustBoundary(node, offset) {
            const editorContent = editor.content;
            // If boundary node is the editor itself
            // put the cursor at the end of the last child.
            if (node === editorContent) {
                // If there's a last child that's a div, go inside it
                if (editorContent.lastChild && editorContent.lastChild.nodeName === 'DIV') {
                let newPlacement = editorContent.lastChild;

                // If that div's lastChild is a text node, set boundary there
                if (newPlacement.lastChild && newPlacement.lastChild.nodeType === Node.TEXT_NODE) {
                    node = newPlacement.lastChild;
                    offset = node.nodeValue.length;
                } else {
                    // fallback: place boundary at the end of the element
                    node = newPlacement;
                    offset = newPlacement.childNodes.length;
                }
                } else {
                    // fallback to the end of the editor
                    node = editorContent;
                    offset = editorContent.childNodes.length;
                }
            }

            // If boundary's parent is a markdown syntax span or a mention span
            if (node.parentNode &&
                isMarkdownSyntax(node.parentNode) ||
                isMention(node.parentNode)) {

                let parentSpan = node.parentNode;
                const spanTextLength = parentSpan.textContent.length;

                // If the node is at the start of a span tag, move it into the inner text node child if valid
                if (offset === 0 && parentSpan.previousSibling) {
                    const prev = parentSpan.previousSibling;
                    if (prev.nodeType === Node.TEXT_NODE) {
                        node = prev;
                        offset = node.nodeValue.length; // jump to end
                    } else if (prev.lastChild && prev.lastChild.nodeType === Node.TEXT_NODE) {
                        node = prev.lastChild;
                        offset = node.nodeValue.length;
                    } else {
                        // fallback: place boundary at the end of prev
                        node = prev;
                        offset = prev.childNodes.length;
                    }
                }
                // If the node is at the end of a span tag, move it into the inner text node child if valid
                else if (offset >= spanTextLength && parentSpan.nextSibling) {
                    const next = parentSpan.nextSibling;
                    if (next.nodeType === Node.TEXT_NODE) {
                        node = next;
                        offset = 0; // jump to start
                    } else if (next.firstChild && next.firstChild.nodeType === Node.TEXT_NODE) {
                        node = next.firstChild;
                        offset = 0;
                    } else {
                        // fallback: place boundary at the start of next
                        node = next;
                        offset = 0;
                    }
                }
            }

            return { node, offset };
        }

        /**
         * Adjust the selection boundaries to ensure the cursor is placed correctly
         * This is necessary because the user's selection is not limited to just text nodes and can range across multiple elements.
         * This function adjusts boundaries for common instances where the user would want to highlight or adjust text within a markdown syntax span.
        */
        function fixSelectionBoundaries() {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);

            // Capture the old boundaries
            const oldStartContainer = range.startContainer;
            const oldStartOffset = range.startOffset;
            const oldEndContainer = range.endContainer;
            const oldEndOffset = range.endOffset;

            // Adjust the start boundary
            const start = adjustBoundary(range.startContainer, range.startOffset);

            // Adjust the end boundary
            const end = adjustBoundary(range.endContainer, range.endOffset);


            // If no change, return
            const boundariesUnchanged =
              start.node === oldStartContainer &&
              start.offset === oldStartOffset &&
              end.node === oldEndContainer &&
              end.offset === oldEndOffset;
            if (boundariesUnchanged) {
              return;
            }
            // Rebuild the range
            range.setStart(start.node, start.offset);
            range.setEnd(end.node, end.offset);

            // Remove all ranges
            selection.removeAllRanges();

            // Add the new range to the selection
            selection.addRange(range);
        }

        /**
         * Given a range and nodeName, Determines what markdown syntax is present at the cursor position
        */
        function determineSelectionDecorator(range, nodeName) {
            let parent = range.commonAncestorContainer;
            if (parent.nodeType === Node.TEXT_NODE) {
                parent = parent.parentNode;
            }
            // if the parent is a italic node, and we're looking for bold, look one more level up as we wrap <b> in <i> for bold italic
            if (parent.nodeName === 'I' && nodeName === 'B') {
                parent = parent.parentNode;
            }
            return parent.nodeName === nodeName;
        };

        // Define the allowed syntax tags
        const ALLOWED_SYNTAX_TAGS = {
            italic: 'I',
            bold: 'B',
            strikeThrough: 'S',
        };

        // Track the last content value
        let lastContent = '';

        /**
         * Function for determining if the user is typing a mention.
         * Uses getSurroundingTextFromSelection to see if there's an '@' or '#' ahead of the the cursor.
         * Also detects if the cursor is inside a span with class starting with "mention" from a previous mention.
         */
        const validMarkerCharacters = { '#': true, '@': true, ':': true };
        function checkForInsertionMarkerAroundCursor() {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) {
                return '';
            }

            const range = selection.getRangeAt(0);
            const container = range.startContainer;

            // Ensure that we are in a text node
            if (container.nodeType !== Node.TEXT_NODE) {
                return '';
            }

            // If the cursor is within a valid mention span parent, return that content
            if (isMention(container?.parentNode)) {
                return {
                    character: container.textContent[0],
                    mention: container.textContent,
                };
            }

            // Get text around selection
            const { textBeforeCursor, textAfterCursor } = getSurroundingTextFromSelection();

            if (textAfterCursor.length > 0 && !/\\s/.test(textAfterCursor[0])) {
                return '';
            }
            let i = textBeforeCursor.length - 1;
            while (i >= 0) {
                const char = textBeforeCursor[i];
                // If we hit whitespace first, no valid mention
                if (/\\s/.test(char)) {
                    return '';
                }

                // Check for valid insertion marker symbols
                if (validMarkerCharacters[char]) {
                    // Check if it's start of the string or preceded by whitespace
                    if (i === 0 || /\\s/.test(textBeforeCursor[i - 1])) {
                        // Valid mention found!
                        return {
                            character: char,
                            mention: textBeforeCursor.slice(i),
                        };
                    }
                    // Otherwise return, we're in the middle of a word, not a valid mention
                    return '';
                }

                i--;
            }

            // If we never find a valid mention symbol, return
            return '';
        }


        const findInsertionMarker = (container, offset, markerCharacter) => {
            const textContent = container.textContent;
            const markerStartIndex = textContent.lastIndexOf(markerCharacter, offset - 1);
            if (markerStartIndex === -1) {
                return null;
            }
            return {
                markerSearchText: textContent.slice(markerStartIndex, offset),
                beforeMarker: textContent.slice(0, markerStartIndex),
                afterMarker: textContent.slice(offset)
            };
        };

        /**
         * Inserts a mention into the editor.
         * mentionType - The type of mention. This determines the applied class and character.
         * mentionText - The text of the mention.
         * mentionUrl - The URL of the mention. we tack this on as a data attribute and use it for the link construction when sending the message.
         */
        function insertMention({ mentionType, mentionText, mentionUrl }) {
            let mentionClass = '';
            let mentionCharacter = '';

            // apply mention class and character
            if (mentionType === 'user') {
                mentionClass = 'mention-user';
                mentionCharacter = '@';
            } else if (mentionType === 'role') {
                mentionClass = 'mention-role';
                mentionCharacter = '@';
            } else if (mentionType === 'global') {
                mentionClass = 'mention-global';
                mentionCharacter = '@';
            } else if (mentionType === 'channel') {
                mentionClass = 'mention-channel';
                mentionCharacter = '#';
            }

            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const container = range.startContainer;
            const offset = range.startOffset;

            let mentionSpan = null;

            // Check if we are already inside an existing mention span
            if (
                container.nodeType === Node.TEXT_NODE &&
                isMention(container.parentNode)
            ) {
                // We are inside an existing mention span. Replace its text content.
                mentionSpan = container.parentNode;
                mentionSpan.textContent = mentionText;
            } else {
                // Make sure we're dealing with a text node
                if (container.nodeType !== Node.TEXT_NODE) {
                    return;
                }

                const insertionMarker = findInsertionMarker(container, offset, mentionCharacter);
                if (!insertionMarker) {
                    return;
                }
                const { beforeText: beforeMention, afterText: afterMention } = insertionMarker;

                // Create the span for our mention
                mentionSpan = document.createElement('span');
                mentionSpan.className = mentionClass;
                mentionSpan.textContent = mentionText;
                mentionSpan.dataset.mentionUrl = mentionUrl;

                // Insert the newly-created pieces into the DOM
                const parentNode = container.parentNode;

                // add back text before mention
                if (beforeMention) {
                    parentNode.insertBefore(document.createTextNode(beforeMention), container);
                }

                // add mention span
                parentNode.insertBefore(mentionSpan, container);

                // add back text after mention
                if (afterMention) {
                    parentNode.insertBefore(document.createTextNode(afterMention), container);
                }

                // Remove the original text node now that its split/replaced
                parentNode.removeChild(container);
            }

            // Insert a space node (a normal space is typically trimmed by the browser if inserted at the end of a node, so we use a visible space character)
            const spaceNode = document.createTextNode('\u00A0');
            mentionSpan.parentNode.insertBefore(spaceNode, mentionSpan.nextSibling);

            // Place cursor at the end of the space node
            const newRange = document.createRange();
            newRange.setStart(spaceNode, spaceNode.textContent.length);
            newRange.collapse(true);

            selection.removeAllRanges();
            selection.addRange(newRange);

            postContentUpdate();
        }

        /**
         * Unwraps the parent mention span if the current selection's range is inside on input
         * Preserve the original text node(s) and the selection range.
         */
        function cleanupMentionEdit() {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);

            // Remember start/end containers and offsets
            const startNode = range.startContainer;
            const startOffset = range.startOffset;
            const endNode = range.endContainer;
            const endOffset = range.endOffset;

            // Find mention span for both start and end
            const mentionParentStart = startNode.parentNode;
            const mentionParentEnd = endNode.parentNode;

            // If both ends are inside the same mention span
            if (mentionParentStart && mentionParentEnd && isMention(mentionParentStart) && isMention(mentionParentEnd) && mentionParentStart === mentionParentEnd) {
                const mentionSpan = mentionParentStart;

                // Unwrap the mention span by moving its children up into the span's parent.
                const parent = mentionSpan.parentNode;
                const nextSibling = mentionSpan.nextSibling;

                // Move all child nodes of <span> before the <span> itself
                while (mentionSpan.firstChild) {
                    parent.insertBefore(mentionSpan.firstChild, nextSibling);
                }

                // Remove empty span
                parent.removeChild(mentionSpan);

                // Restore the original selection using the same node references and offsets
                selection.removeAllRanges();
                range.setStart(startNode, startOffset);
                range.setEnd(endNode, endOffset);
                selection.addRange(range);
            }
        }

        function insertMentionStarter() {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const container = range.startContainer;

            if (container.nodeType === Node.TEXT_NODE && isMention(container.parentNode)) {
                return;
            }

            const offset = range.startOffset;


            // Create a text node with "@"
            const atSymbolNode = document.createTextNode("@");

            // Insert the text node at the current selection
            range.insertNode(atSymbolNode);

            // Move the cursor right after the "@" character
            range.setStart(atSymbolNode, 1);
            range.collapse(true);

            // Clear the current selection and set the new range
            selection.removeAllRanges();
            selection.addRange(range);

            postContentUpdate();
        }


        /**
         * Inserts an emoji into the editor.
        */
        let lastActiveRange;
        function insertEmoji(emoji) {
            const selection = window.getSelection();
            let range = lastActiveRange ?? selection.getRangeAt(0);
            if (!range) {
              range = document.createRange();
              range.selectNodeContents(editor);
              range.collapse(false);

              selection.removeAllRanges();
              selection.addRange(range);
            }

            const container = range.startContainer;

            if (container.nodeType === Node.TEXT_NODE && isMention(container.parentNode)) {
                return;
            }
            const emojiNode = document.createTextNode(emoji);
            range.insertNode(emojiNode);

            range.setStartAfter(emojiNode);
            selection.removeAllRanges();
            selection.addRange(range);

            postContentUpdate();
        }
        /**
         * Inserts an emoji into the editor and replaces the search and marker with the emoji.
         */
        function replaceSearchAndInsertEmoji(emoji) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const container = range.startContainer;

            if (container.nodeType === Node.TEXT_NODE && isMention(container.parentNode)) {
                return;
            }

            const offset = range.startOffset;
            let beforeEmoji = '';
            let afterEmoji = '';

            const emojiData = findInsertionMarker(container, offset, ":");
            if (!emojiData) return;

            beforeEmoji = emojiData.beforeMarker;
            afterEmoji = emojiData.afterMarker;

            const emojiNode = document.createTextNode(emoji);
            const parentNode = container.parentNode;

            if (beforeEmoji) {
                parentNode.insertBefore(document.createTextNode(beforeEmoji), container);
            }

            parentNode.insertBefore(emojiNode, container);

            if (afterEmoji) {
                parentNode.insertBefore(document.createTextNode(afterEmoji), emojiNode.nextSibling);
            }

            parentNode.removeChild(container);
            const spaceNode = document.createTextNode('\u00A0');
            parentNode.insertBefore(spaceNode, emojiNode.nextSibling);
            range.setStart(spaceNode, 1);
            range.collapse(true);


            selection.removeAllRanges();
            selection.addRange(range);
            postContentUpdate();
        }



        /**
         * Inserts a markdown content string into the editor, parsing mentions and supported markdown decorations.
         */
        function insertMarkdown(content) {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          editorContent.innerHTML = content;

          const spaceNode = document.createTextNode('\u00A0');
          editorContent.appendChild(spaceNode);

          const newRange = document.createRange();
          selection.removeAllRanges();

          newRange.selectNodeContents(editorContent);
          newRange.collapse();
          selection.addRange(newRange);

          parseMarkdown();

          postContentUpdate();
        }

        var Actions = {
            toggleMarkdown: { result: function (type) { return toggleMarkdown(type) }},
            insertMention: { result: function (mentionData) { return insertMention(mentionData) }},
            insertMentionStarter: { result: function () { return insertMentionStarter() }},
            insertEmoji: { result: function (emoji) { return insertEmoji(emoji) }},
            replaceSearchAndInsertEmoji: { result: function (emoji) { return replaceSearchAndInsertEmoji(emoji) }},
            insertMarkdown: { result: function (content) { return insertMarkdown(content) }},
            italic: { state: function() { return queryCommandState('italic'); }, result: function() { return exec('italic'); }},
            underline: { state: function() { return queryCommandState('underline'); }, result: function() { return exec('underline'); }},
            strikeThrough: { state: function() { return queryCommandState('strikeThrough'); }, result: function() { return exec('strikeThrough'); }},
            subscript: { state: function() { return queryCommandState('subscript'); }, result: function() { return exec('subscript'); }},
            superscript: { state: function() { return queryCommandState('superscript'); }, result: function() { return exec('superscript'); }},
            heading1: { state: function() { return queryCommandValue(formatBlock) === 'h1'; }, result: function() { return exec(formatBlock, '<h1>'); }},
            heading2: { state: function() { return queryCommandValue(formatBlock) === 'h2'; }, result: function() { return exec(formatBlock, '<h2>'); }},
            heading3: { state: function() { return queryCommandValue(formatBlock) === 'h3'; }, result: function() { return exec(formatBlock, '<h3>'); }},
            heading4: { state: function() { return queryCommandValue(formatBlock) === 'h4'; }, result: function() { return exec(formatBlock, '<h4>'); }},
            heading5: { state: function() { return queryCommandValue(formatBlock) === 'h5'; }, result: function() { return exec(formatBlock, '<h5>'); }},
            heading6: { state: function() { return queryCommandValue(formatBlock) === 'h6'; }, result: function() { return exec(formatBlock, '<h6>'); }},
            paragraph: { state: function() { return queryCommandValue(formatBlock) === 'p'; }, result: function() { return exec(formatBlock, '<p>'); }},
            quote: { result: function() { return exec(formatBlock, '<blockquote>'); }},
            removeFormat: { result: function() { return exec('removeFormat'); }},
            orderedList: {
                state: function() { return !checkboxNode(window.getSelection().anchorNode) && queryCommandState('insertOrderedList'); },
                result: function() {
                    if (!!checkboxNode(window.getSelection().anchorNode)) return;

                    let flag = exec('insertOrderedList');
                    adjustNestedElements();
                    return flag;
                }
            },
            unorderedList: {
                state: function() { return queryCommandState('insertUnorderedList');},
                result: function() {
                    if (!!checkboxNode(window.getSelection().anchorNode)) return;

                    let flag =  exec('insertUnorderedList');
                    adjustNestedElements();
                    return flag;
                }
            },
            code: { result: function(type) {
                var flag = exec(formatBlock, '<pre>');
                var node = anchorNode.nodeName === "PRE" ? anchorNode: anchorNode.parentNode;
                if (node.nodeName === 'PRE'){
                    type && node.setAttribute("type", type);
                    node.innerHTML = "<code type='"+(type || '') +"'>" + node.innerHTML + "</code>";
                    // var br = createElement("br");
                    // node.parentNode.insertBefore(br, node.nextSibling);
                    setTimeout(function (){
                        setCollapse(node.firstChild);
                    });
                }
                return flag;
             }},
            line: { result: function() { return exec('insertHorizontalRule'); }},
            redo: { result: function() { return exec('redo'); }},
            undo: { result: function() { return exec('undo'); }},
            indent: { result: function() { return exec('indent'); }},
            outdent: { result: function() { return exec('outdent'); }},
            outdent: { result: function() { return exec('outdent'); }},
            justifyCenter: {  state: function() { return queryCommandState('justifyCenter'); }, result: function() { return exec('justifyCenter'); }},
            justifyLeft: { state: function() { return queryCommandState('justifyLeft'); }, result: function() { return exec('justifyLeft'); }},
            justifyRight: { state: function() { return queryCommandState('justifyRight'); }, result: function() { return exec('justifyRight'); }},
            justifyFull: { state: function() { return queryCommandState('justifyFull'); }, result: function() { return exec('justifyFull'); }},
            hiliteColor: {  state: function() { return queryCommandValue('backColor'); }, result: function(color) { return exec('backColor', color); }},
            foreColor: { state: function() { return queryCommandValue('foreColor'); }, result: function(color) { return exec('foreColor', color); }},
            fontSize: { state: function() { return queryCommandValue('fontSize'); }, result: function(size) { return exec('fontSize', size); }},
            fontName: { result: function(name) { return exec('fontName', name); }},
            link: {
                // result: function(data) {
                //     data = data || {};
                //     var title = data.title;
                //     title = title || window.getSelection().toString();
                //     // title = title || window.prompt('Enter the link title');
                //     var url = data.url || window.prompt('Enter the link URL');
                //     if (url){
                //         exec('insertHTML', "<a href='"+ url +"'>"+(title || url)+"</a>");
                //     }
                // }
                result: function(data) {
                    var sel = document.getSelection();
                    data = data || {};
                    var url = data.url || window.prompt('Enter the link URL');

                    if (url) {
                        let href = url
                        if (${defaultHttps} && !href.startsWith("http")) {
                            href = "https://" + href
                        }

                        var el = document.createElement("a");
                        el.setAttribute("href", href);

                        var title = data.title || sel.toString() || url;
                        el.text = title;

                        // when adding a link, if our current node is empty, it may have a <br>
                        // if so, replace it with '' so the added link doesn't end up with an extra space.
                        // Also, if totally empty, we must format the paragraph to add the link into the container.
                        var mustFormat = false;
                        if (sel.anchorNode && sel.anchorNode.innerHTML === '<br>') {
                            sel.anchorNode.innerHTML = '';
                        } else if (!sel.anchorNode || sel.anchorNode === editor.content) {
                            mustFormat = true;
                        }

                        // insert like this so we can replace current selection, if any
                        var range = sel.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(el);

                        // restore cursor to end
                        range.setStartAfter(el);
                        range.setEndAfter(el);
                        sel.removeAllRanges();
                        sel.addRange(range);

                        // format paragraph if needed
                        if (mustFormat){
                            formatParagraph();
                        }

                        // save selection, and fire on change to our webview
                        saveSelection();
                        editor.settings.onChange();
                    }
                }
            },
            image: {
                result: function(url, style) {
                    if (url){
                        exec('insertHTML', "<img style='"+ (style || '')+"' src='"+ url +"'/>");
                        // This is needed, or the image will not be inserted if the html is empty
                        exec('insertHTML', "<br/>");
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            html: {
                result: function (html){
                    if (html){
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            text: { result: function (text){ text && exec('insertText', text); }},
            video: {
                result: function(url, style) {
                    if (url) {
                        var thumbnail = url.replace(/.(mp4|m3u8)/g, '') + '-thumbnail';
                        var html = "<br><div style='"+ (style || '')+"'><video src='"+ url +"' poster='"+ thumbnail + "' controls><source src='"+ url +"' type='video/mp4'>No video tag support</video></div><br>";
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            checkboxList: {
                state: function(){return checkboxNode(window.getSelection().anchorNode)},
                result: function() {
                    if (queryCommandState('insertOrderedList')) return;
                    var pNode;
                    if (anchorNode){
                        pNode = anchorNode.parentNode;
                        if (anchorNode === editor.content) pNode = null;
                    }

                    if (anchorNode === editor.content || queryCommandValue(formatBlock) === ''){
                        formatParagraph();
                    }
                    var box = checkboxNode(anchorNode);
                    if (!!box){
                        cancelCheckboxList(box.parentNode);
                    } else {
                        !queryCommandState('insertOrderedList') && execCheckboxList(pNode);
                    }
                }
            },
            content: {
                setDisable: function(dis){ this.blur(); editor.content.contentEditable = !dis},
                setHtml: function(html) { editor.content.innerHTML = html; Actions.UPDATE_HEIGHT(); },
                getHtml: function() { return editor.content.innerHTML; },
                blur: function() { editor.content.blur(); },
                focus: function() { focusCurrent(); },
                postHtml: function (){ postAction({type: 'CONTENT_HTML_RESPONSE', data: editor.content.innerHTML}); },
                setPlaceholder: function(placeholder){ editor.content.setAttribute("placeholder", placeholder) },

                setContentStyle: function(styles) {
                    styles = styles || {};
                    var bgColor = styles.backgroundColor, color = styles.color, pColor = styles.placeholderColor;
                    if (bgColor && bgColor !== body.style.backgroundColor) body.style.backgroundColor = bgColor;
                    if (color && color !== editor.content.style.color) editor.content.style.color = color;
                    if (pColor && pColor !== placeholderColor){
                        var rule1="[placeholder]:empty:before {content:attr(placeholder);color:"+pColor+";}";
                        var rule2="[placeholder]:empty:focus:before{content:attr(placeholder);color:"+pColor+";}";
                        try {
                            document.styleSheets[1].deleteRule(0);document.styleSheets[1].deleteRule(0);
                            document.styleSheets[1].insertRule(rule1); document.styleSheets[1].insertRule(rule2);
                            placeholderColor = pColor;
                        } catch (e){
                            console.log("set placeholderColor error!")
                        }
                    }
                },

                commandDOM: function (command){
                    try {new Function("$", command)(exports.document.querySelector.bind(exports.document))} catch(e){console.log(e.message)};
                },
                command: function (command){
                    try {new Function("$", command)(exports.document)} catch(e){console.log(e.message)};
                }
            },

            init: function (){
                if (${useContainer}){
                    // setInterval(Actions.UPDATE_HEIGHT, 150);
                    Actions.UPDATE_HEIGHT();
                } else {
                    // react-native-webview There is a bug in the body and html height setting of a certain version of 100%
                    // body.style.height = docEle.clientHeight + 'px';
                }
            },

            UPDATE_HEIGHT: function() {
                if (!${useContainer}) return;
                // var height = Math.max(docEle.scrollHeight, body.scrollHeight);
                var height = editor.content.scrollHeight;
                if (o_height !== height){
                    _postMessage({type: 'OFFSET_HEIGHT', data: o_height = height});
                }
            },

            POST_CONTENT_UPDATE: function() {
                const contentHtml = editor.content.innerHTML; // Get the content from the editable div
                _postMessage({type: 'CONTENT_CHANGE', data: contentHtml }); // Post the content to the webview
            },

            UPDATE_OFFSET_Y: function (){
                if (!${useContainer}) return;
                var node = anchorNode || window.getSelection().anchorNode;
                var sel = window.getSelection();
                if (node){
                    var siblingOffset = (node.nextSibling && node.nextSibling.offsetTop) || (node.previousSibling && node.previousSibling.offsetTop)
                    var rectOffset = null;
                    if (sel.rangeCount > 0) {
                        var range = sel.getRangeAt(0);
                        var rect = range.getClientRects()[0];
                        rectOffset = rect ? rect.y : null;
                    }

                    var offsetY = node.offsetTop || siblingOffset || rectOffset || node.parentNode.offsetTop;
                    if (offsetY){
                        _postMessage({type: 'OFFSET_Y', data: offsetY});
                    }
                }
            }
        };

        var init = function init(settings) {

            var paragraphSeparator = settings[defaultParagraphSeparatorString];
            var content = settings.element.content = createElement('div');
            content.id = 'content';
            content.contentEditable = true;
            content.spellcheck = false;
            content.autofocus = ${initialFocus};
            content.enterKeyHint = '${enterKeyHint}';
            content.autocapitalize = '${autoCapitalize}';
            content.autocorrect = ${autoCorrect};
            content.autocomplete = 'off';
            content.className = "pell-content";
            content.oninput = function (_ref) {
                // var firstChild = _ref.target.firstChild;
                if ((anchorNode === void 0 || anchorNode === content) && queryCommandValue(formatBlock) === ''){
                    if ( !compositionStatus || anchorNode === content){
                        formatParagraph(true);
                        paragraphStatus = 0;
                    } else {
                        paragraphStatus = 1;
                    }
                } else if (content.innerHTML === '<br>' || content.innerHTML === '<div><br></div><br>' || (lastContent === '<div><br></div><div><br></div>' && content.innerHTML === '<div><br></div>')){
                    content.innerHTML = '';
                } else if (enterStatus && queryCommandValue(formatBlock) === 'blockquote') {
                    formatParagraph();
                }

                saveSelection();
                handleChange(_ref);
                settings.onChange();
                if (content.innerHTML) {
                    cleanupMentionEdit();
                    parseMarkdown();
                }
                lastContent = content.innerHTML;
                ${inputListener} && postAction({type: "ON_INPUT", data: {inputType: _ref.inputType, data: _ref.data}});
            };
            appendChild(settings.element, content);

            if (settings.styleWithCSS) exec('styleWithCSS');
            exec(defaultParagraphSeparatorString, paragraphSeparator);

            var actionsHandler = [];
            for (var k in Actions){
                if (typeof Actions[k] === 'object' && Actions[k].state){
                    actionsHandler[k] = Actions[k]
                }
            }

            function handler() {
                var activeTools = [];
                for(var k in actionsHandler){
                    const state =  Actions[k].state()
                    if ( state ){
                        activeTools.push(typeof state === "boolean" ? k : {type: k, value: Actions[k].state()});
                    }
                }
                postAction({type: 'SELECTION_CHANGE', data: activeTools});
            };

            var _handleStateDT = null;
            function handleState(){
                clearTimeout(_handleStateDT);
                _handleStateDT = setTimeout(function (){
                    handler();
                    saveSelection();
                }, 50);
            }

            function handleSelecting(event){
                event.stopPropagation();
                handleState();
            }

            function postKeyAction(event, type){
                postAction({type: type, data: {keyCode: event.keyCode, key: event.key}});
            }
            function handleKeyup(event){
                enterStatus = 0;
                _keyDown = false;
                if (event.keyCode === 8) handleSelecting (event);
                ${keyUpListener} && postKeyAction(event, "CONTENT_KEYUP")
            }
            function handleKeydown(event){
                _keyDown = true;
                 handleState();
                if (event.key === 'Enter'){
                    enterStatus = 1; // set enter true
                    var box;
                    var block = queryCommandValue(formatBlock);
                    if (anchorNode.innerHTML === '<br>' && anchorNode.parentNode !== editor.content){
                        // setCollapse(editor.content);
                    } else if (queryCommandState('insertOrderedList') && !!(box = checkboxNode(anchorNode))){
                        var node = anchorNode && anchorNode.childNodes[1];
                        if (node && node.nodeName === 'BR'){
                            cancelCheckboxList(box.parentNode);
                            event.preventDefault();
                        } else{
                            // add checkbox
                            _checkboxFlag = 1;
                        }
                    }
                    if (block === 'pre' && anchorNode.innerHTML === '<br>'){
                        // code end enter new line (Unfinished)
                        if (!anchorNode.nextSibling){
                            event.preventDefault();
                            var node = anchorNode.parentNode;
                            var br = createElement("br");
                            node.parentNode.insertBefore(br, node.nextSibling);
                            setTimeout(function (){
                                setCollapse(br);
                            });
                        }
                    }
                }
                ${keyDownListener} && postKeyAction(event, "CONTENT_KEYDOWN");
            }
            function handleFocus (){
                editorFoucs = true;
                setTimeout(function (){
                    Actions.UPDATE_OFFSET_Y();
                });
                postAction({type: 'CONTENT_FOCUSED'});
            }
            function handleBlur (){
                editorFoucs = false;
                postAction({type: 'SELECTION_CHANGE', data: []});
                postAction({type: 'CONTENT_BLUR' });
            }
            function handleClick(event){
                var ele = event.target;
                if (ele.nodeName === 'INPUT' && ele.type === 'checkbox'){
                    // Set whether the checkbox is selected by default
                    if (ele.checked) ele.setAttribute('checked', '');
                    else ele.removeAttribute('checked');
                }
                if (ele.nodeName === 'A' && ele.getAttribute('href')) {
                    postAction({type: 'LINK_TOUCHED', data: ele.getAttribute('href')});
                }
            }
            addEventListener(content, 'touchcancel', handleSelecting);
            addEventListener(content, 'mouseup', handleSelecting);
            addEventListener(content, 'touchend', handleSelecting);
            addEventListener(content, 'keyup', handleKeyup);
            addEventListener(content, 'click', handleClick);
            addEventListener(content, 'keydown', handleKeydown);
            addEventListener(content, 'blur', handleBlur);
            addEventListener(content, 'focus', handleFocus);
            addEventListener(content, 'paste', function (e) {
                // get text representation of clipboard
                var text = (e.originalEvent || e).clipboardData.getData('text/plain');

                ${pasteListener} && postAction({type: 'CONTENT_PASTED', data: text});
                if (${pasteAsPlainText}) {
                    // cancel paste
                    e.preventDefault();
                    // insert text manually
                    exec("insertText", text);
                }
            });
            addEventListener(content, 'compositionstart', function(event){
                if(${useCharacter}){
                    compositionStatus = 1;
                }
            })
            addEventListener(content, 'compositionend', function (event){
                if(${useCharacter}){
                    compositionStatus = 0;
                    paragraphStatus && formatParagraph(true);
                }
            })

            var message = function (event){
                var msgData = JSON.parse(event.data), action = Actions[msgData.type];
                if (action ){
                    if ( action[msgData.name]){
                        var flag = msgData.name === 'result';
                        // insert image or link need current focus
                        flag && focusCurrent();
                        action[msgData.name](msgData.data, msgData.options);
                        flag && handleState();
                    } else {
                        action(msgData.data, msgData.options);
                    }
                }
            };
            const markerToFieldMap = {
                '#': 'channelMention',
                '@': 'userMention',
                ':': 'emojiShortcodeMention'
            };
            document.addEventListener('selectionchange', () => {
                // basic cursor data - determine if current range is in a bold or italic block
                // and check for mention characters
                const range = window.getSelection().getRangeAt(0);
                const cursorData = { type: 'cursor', decorators: { bold: false, italic: false, strikeThrough: false }, channelMention: '', userMention: '', emojiShortcodeMention: '' };
                if (range) {
                    lastActiveRange = range;
                    // update selection boundaries to ensure the cursor is in the right place
                    fixSelectionBoundaries();

                    const isBold = determineSelectionDecorator(range, ALLOWED_SYNTAX_TAGS.bold);
                    if (isBold) {
                        cursorData.decorators.bold = true;
                    }
                    const isItalic = determineSelectionDecorator(range, ALLOWED_SYNTAX_TAGS.italic);
                    if (isItalic) {
                        cursorData.decorators.italic = true;
                    }
                    const isStrikeThrough = determineSelectionDecorator(range, ALLOWED_SYNTAX_TAGS.strikeThrough);
                    if (isStrikeThrough) {
                        cursorData.decorators.strikeThrough = true;
                    }
                    if (!isBold && !isItalic && !isStrikeThrough) {
                        const insertionMarker = checkForInsertionMarkerAroundCursor();
                        if (insertionMarker) {
                            cursorData[markerToFieldMap[insertionMarker.character]] = insertionMarker.mention;
                        }
                    }
                }

                postAction({type: 'SELECTION_CHANGE', data: cursorData });
            });
            document.addEventListener("message", message , false);
            window.addEventListener("message", message , false);
            document.addEventListener('mouseup', function (event) {
                event.preventDefault();
                Actions.content.focus();
                handleSelecting(event);
            });
            return {content, paragraphSeparator: paragraphSeparator, settings};
        };

        var _handleCTime = null;
        editor = init({
            element: document.getElementById('editor'),
            defaultParagraphSeparator: '${defaultParagraphSeparator}',
            styleWithCSS: ${styleWithCSS},
            onChange: function (){
                clearTimeout(_handleCTime);
                _handleCTime = setTimeout(function(){
                    var html = Actions.content.getHtml();
                    postAction({type: 'CONTENT_CHANGE', data: html});
                }, 50);
            }
        })
        return {
            sendEvent: function (type, data){
                event.preventDefault();
                event.stopPropagation();
                var id = event.currentTarget.id;
                if ( !id ) event.currentTarget.id = id = generateId();
                _postMessage({type, id, data});
            }
        }
    })({
        window: window.ReactNativeWebView || window.parent,
        isRN: !!window.ReactNativeWebView ,
        document: document
    });
</script>
</body>
</html>
`;
}

const HTML = createHTML();
export {HTML, createHTML, getContentCSS};
