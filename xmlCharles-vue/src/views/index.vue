<template>
  <div style="padding: 20px;max-height: 100vh;overflow-y: auto;">
    <a-row   type="flex" justify="center">
      <div @click="openFiles" id="file-area" @dragenter.prevent @drop.prevent.stop="fileBoxDrag"  @dragover.prevent @dragleave.prevent>
        <a-icon type="cloud-upload" />
      </div>
    </a-row>
    <a-row type="flex" justify="space-between" style="margin-top: 30px">
      <a-col :span="17" >
        <a-row>
          <a-col :span="8">
            <div style="display: flex;align-items: center;margin-left: 10px;">
              <a-tooltip>
                <template #title>
                  自动复制开关
                </template>
                <a-switch v-model="configure.autoCopy.enabled" style="margin-left: 10px"/>
              </a-tooltip>
              <a-tooltip style="margin-left: 10px">
                <template #title>
                  手动复制
                </template>
                <a-icon type="copy" @click="manualCopy" />
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-row>
      <a-textarea v-model="text" style="width: 100%;height: 500px;margin-top: 10px;"></a-textarea>
    </a-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uToolsUtils from '../js/uToolsUtils'
import {
  enable as enableDarkMode,
  disable as disableDarkMode
} from 'darkreader'
const xml2js = require('xml2js')

export default {
  data () {
    return {
      text: ''
    }
  },
  computed: {
    ...mapState(['configure'])
  },
  created () {
    // eslint-disable-next-line no-undef
    utools.onPluginReady(() => {
      // 版本检查
      uToolsUtils.isNewVersion()
      // 数据读入
      uToolsUtils.readAll()
    })
    // eslint-disable-next-line no-undef
    utools.onPluginOut(() => {
      window.saveALL()
    })
    // 进入插件
    window.utools.onPluginEnter(({ code, type, payload, optional }) => {
      if (window.utools.isDarkColors()) {
        enableDarkMode({
          darkSchemeBackgroundColor: '#303133'
        })
      } else {
        disableDarkMode()
      }
      console.log(payload)
      if (type === 'files') {
        console.log(payload)
        if (payload.length === 1) {
          this.tranformXmlPath2Text(payload[0].path, this.transformXmlCallback)
        }
      }
    })
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
    })
  },
  methods: {
    openFiles () {
      const paths = window.selectFile()
      if (paths instanceof Array) {
        paths.forEach(path => {
          const item = window.readFile(path)
          this.tranformXml2Text(item, this.transformXmlCallback)
        })
      }
    },
    // 复制
    copy (text) {
      console.log(text)
      console.log(this)
      this.$copyText(text).then(() => {
        this.$message.success('复制成功')
      })
    },
    // 插件内文件拖动复制
    fileBoxDrag (e) {
      const files = [];
      [].forEach.call(e.dataTransfer.files, function (file) {
        files.push(file)
      }, false)
      console.log(files)
      files.forEach(item => {
        const allowFormat = ['text/xml']
        if (allowFormat.includes(item.type)) {
          this.tranformXml2Text(item, this.transformXmlCallback)
        } else {
          this.$message.warning('不支持该格式')
        }
      })
    },
    getUploadUrl (flie) {
      let url = ''
      if (window.createObjectURL !== undefined) {
        // basic
        url = window.createObjectURL(flie)
      } else if (window.webkitURL !== undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(flie)
      } else if (window.URL !== undefined) {
        // mozilla(firefox)
        url = window.URL.createObjectURL(flie)
      }
      return url // 返回这样的一串地址 blob:http://www.xxxx.com/2c230fa5-ecc4-4314-ae7c-c39eaa66a945
    },
    loadXML (xmlFile) {
      var xmlDom = null
      if (window.ActiveXObject) {
        xmlDom = new window.ActiveXObject('Microsoft.XMLDOM')
        xmlDom.async = 'false'
        xmlDom.load(xmlFile)
      } else if (
        document.implementation &&
          document.implementation.createDocument
      ) {
        var xmlhttp = new window.XMLHttpRequest()
        xmlhttp.open('GET', xmlFile, false)
        xmlhttp.send(null)
        xmlDom = xmlhttp.responseXML
      } else {
        xmlDom = null
      }
      return xmlDom // 返回的是一个doucument的对象
    },
    tranformXmlPath2Text (path, callback) {
      this.tranformXml2Text(window.readFile(path), callback)
    },
    parseXmlJson2Text (json) {
      const result = json.map.mappings.mapMapping.map(({ sourceLocation, destLocation }) => {
        return `${sourceLocation.host + (sourceLocation.path ?? '')} ${destLocation.host + (destLocation.path ?? '')}`
      }).join('\n')
      return result
    },
    tranformXml2Text (file, callback) {
      const url = this.getUploadUrl(file)
      const xmlDom = this.loadXML(url)
      new xml2js.Parser({ explicitArray: false }).parseString(new XMLSerializer().serializeToString(xmlDom), (err, result) => {
        if (err) {
          console.error(err)
        } else {
          callback(this.parseXmlJson2Text(result))
        }
      })
    },
    transformXmlCallback (text) {
      if (this.configure.autoCopy.enabled) {
        this.copy(text)
      }
      this.text = text
    },
    manualCopy () {
      this.copy(this.text)
    }
  }
}
</script>

<style lang="scss" scoped>
  #file-area {
    width: 100%;
    height: 120px;
    background: #FF707B;
    margin-top: 10px;
    border-radius: 12px;
    transition: all .5s linear;
    font-size: 48px;
    text-align: center;
    color: white;
    line-height: 120px;
    cursor: pointer;
  &:hover {
     box-shadow: 0 3px 12px #FFC6CB;
   }
  }
</style>
