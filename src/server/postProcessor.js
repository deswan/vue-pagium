function getDataName(vue) {
    let idxStart = vue.indexOf('<script>');
    let idxEnd = vue.indexOf('</script>');
    if (!~idxStart || !~idxEnd) throw new Error('vue文件无script标签');
    let script = vue.slice(idxStart + 8, idxEnd);

    let expStart = script.indexOf('export default');
    if (!~expStart) throw new Error('vue文件无export default');
    let vueOptions = script.slice(expStart + 14);

    //替换掉@@为合法标识符
    const pgHash = 'pg______' + Date.now();
    let replacedVueOptions = vueOptions.replace(/@@/g, pgHash)

    let options = new Function('return ' + replacedVueOptions)();

    return {
        data: Object.keys(options.data()),
        methods: Object.keys(options.methods)
    }
}

//替换标识符
function replaceIdentifier(vueText, comObj) {
    let nameData = getDataName(vueText);
    console.log(nameData)
    let comName = comObj.name;
    let regExp = /@@(\D[$\w]*)/g;
    let replacedVueText = vueText.replace(regExp, (match, word) => {
        if (!~nameData.data.indexOf(word) && !~nameData.methods.indexOf(word)) {
            throw new Error('data 或 methods 标识符不存在：' + match)
        } else if (~word.indexOf(nameData.data)) {  //data
            return comName + '.' + word;
        } else {    //methods
            return word;
        }
    })
    return replacedVueText
}

let postProcessor = {
    getDataName,
    replaceIdentifier
}
module.exports = postProcessor