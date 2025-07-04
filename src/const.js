export const actions = {
  content: 'content',

  updateHeight: 'UPDATE_HEIGHT',

  setBold: 'bold',
  setItalic: 'italic',
  setUnderline: 'underline',
  heading1: 'heading1',
  heading2: 'heading2',
  heading3: 'heading3',
  heading4: 'heading4',
  heading5: 'heading5',
  heading6: 'heading6',
  insertLine: 'line',
  setParagraph: 'paragraph',
  removeFormat: 'removeFormat',
  alignLeft: 'justifyLeft',
  alignCenter: 'justifyCenter',
  alignRight: 'justifyRight',
  alignFull: 'justifyFull',
  insertBulletsList: 'unorderedList',
  insertOrderedList: 'orderedList',
  checkboxList: 'checkboxList',
  insertLink: 'link',
  insertText: 'text',
  insertHTML: 'html',
  insertImage: 'image',
  insertVideo: 'video',
  fontSize: 'fontSize',
  fontName: 'fontName',
  setSubscript: 'subscript',
  setSuperscript: 'superscript',
  setStrikethrough: 'strikeThrough',
  setHR: 'horizontalRule',
  indent: 'indent',
  outdent: 'outdent',
  undo: 'undo',
  redo: 'redo',
  code: 'code',
  table: 'table',
  line: 'line',
  foreColor: 'foreColor',
  hiliteColor: 'hiliteColor',
  blockquote: 'quote',
  keyboard: 'keyboard',
  setTitlePlaceholder: 'SET_TITLE_PLACEHOLDER',
  setContentPlaceholder: 'SET_CONTENT_PLACEHOLDER',
  setTitleFocusHandler: 'SET_TITLE_FOCUS_HANDLER',
  setContentFocusHandler: 'SET_CONTENT_FOCUS_HANDLER',
  prepareInsert: 'PREPARE_INSERT',
  restoreSelection: 'RESTORE_SELECTION',
  setCustomCSS: 'SET_CUSTOM_CSS',
  setTextColor: 'SET_TEXT_COLOR',
  setBackgroundColor: 'SET_BACKGROUND_COLOR',
  init: 'init',
  setEditorHeight: 'SET_EDITOR_HEIGHT',
  setFooterHeight: 'SET_FOOTER_HEIGHT',
  setPlatform: 'SET_PLATFORM',
};

export const messages = {
  CONTENT_HTML_RESPONSE: 'CONTENT_HTML_RESPONSE',
  LOG: 'LOG',
  CONTENT_FOCUSED: 'CONTENT_FOCUSED',
  CONTENT_BLUR: 'CONTENT_BLUR',
  SELECTION_CHANGE: 'SELECTION_CHANGE',
  CONTENT_CHANGE: 'CONTENT_CHANGE',
  CONTENT_PASTED: 'CONTENT_PASTED',
  CONTENT_KEYUP: 'CONTENT_KEYUP',
  CONTENT_KEYDOWN: 'CONTENT_KEYDOWN',
  SELECTED_TEXT_RESPONSE: 'SELECTED_TEXT_RESPONSE',
  LINK_TOUCHED: 'LINK_TOUCHED',
  SELECTED_TEXT_CHANGED: 'SELECTED_TEXT_CHANGED',
  OFFSET_HEIGHT: 'OFFSET_HEIGHT',
  OFFSET_Y: 'OFFSET_Y',
  ON_INPUT: 'ON_INPUT',
  CLIENT_CHARACTER_LIMIT: 'CLIENT_CHARACTER_LIMIT',
};
