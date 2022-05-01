import store from '../store/index'
const prefix = 'xml-tools-'
const comKey = ['configure']

function uToolsUtils () {}
uToolsUtils.save = (...keys) => {
  keys.map((key) => {
    const data = store.state[key]
    update(key, data)
  })
}
uToolsUtils.readAll = () => {
  console.log('load....')
  uToolsUtils.read(...comKey)
}
uToolsUtils.read = (...keys) => {
  keys.map((key) => {
    const data = read(key)
    if (data) {
      store.state[key] = { ...store.state[key], ...data }
      console.log(key, store.state[key])
    }
  })
}
/**
 * 删除 key
 */
// eslint-disable-next-line no-unused-vars
function deleteItem (key) {
  // eslint-disable-next-line no-undef
  utools.db.remove(`${prefix}${key}`)
}
/**
 * 获得 数据
 */
function read (key, onlyData = true) {
  // eslint-disable-next-line no-undef
  const data = utools.db.get(`${prefix}${key}`)
  console.log(data)
  if (!data) {
    return false
  }
  if (onlyData) {
    return data.data
  } else {
    return data
  }
}
/**
 * 更新数据
 */
function update (key, data) {
  const readData = read(key, false)
  let res
  if (!readData) {
    // eslint-disable-next-line no-undef
    res = utools.db.put({
      _id: `${prefix}${key}`,
      data: data,
      _rev: readData._rev
    })
  } else {
    // eslint-disable-next-line no-undef
    res = utools.db.put({
      _id: `${prefix}${key}`,
      data: data,
      _rev: readData._rev
    })
  }
  console.log('update' + res.toString())
}

window.saveALL = () => {
  console.log('保存')
  uToolsUtils.save(...comKey)
}
uToolsUtils.isNewVersion = () => {
  // 当前版本
  const pluginInfo = window.pluginInfo
  console.log(pluginInfo)
  // utools 自动更新数据处理
  if (read('version') !== pluginInfo.version) {
    // 是否需要更新数据
    if (window.pluginInfo.update) {
      console.log('更新数据')
    }
    update('version', pluginInfo.version)
    // 打开更新信息窗口
    return true
  } else {
    console.log('false')
    return false
  }
}
export default uToolsUtils
