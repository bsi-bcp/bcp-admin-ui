<template>
    <div class="the-code-editor-container" id="mEditor">
        <div>
        <i v-if="isMaximum" class="el-icon-rank" title="点击缩小" @click="minEditor"></i>
        <i v-else class="el-icon-full-screen" title="点击放大" @click="maxEditor"></i>
        </div>
        <div class="my-editor" ref="container">
        </div>
    </div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import { setTimeout } from 'timers';

export default {
    name: 'AcMonaco',
    props: {
        opts: {
            type: Object,
            default() {
                return {}
            }
        },
        height: {
            type: Number,
            default: 300
        }
    },
    data() {
        return {
            // 主要配置
            defaultOpts: {
                value: '', // 编辑器的值
                theme: 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
                roundedSelection: false, // 右侧不显示编辑器预览框
                autoIndent: true, // 自动缩进
                language: 'javascript'
            },
            isMaximum: false,
            originSize: {
                width: '',
                height: ''
            }
        }
    },
    watch: {
        opts: {
            handler(n) {
                this.init()
            },
            deep: true
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        clearContent(){
            this.monacoEditor.setValue('');
        },
        setValue(data){
            if(this.monacoEditor){
                this.monacoEditor.setValue(data);
            }
        },
        init() {
            // 初始化container的内容，销毁之前生成的编辑器
            this.$refs.container.innerHTML = ''
            
            this.editorOptions = Object.assign(this.defaultOpts, this.opts)
            // 生成编辑器对象
            this.monacoEditor = monaco.editor.create(this.$refs.container, this.editorOptions)
            // 编辑器内容发生改变时触发
            this.monacoEditor.onDidChangeModelContent(() => {
                this.$emit('change', this.monacoEditor.getValue())
            })
        },
        // 供父组件调用手动获取值
        getVal() {
            return this.monacoEditor.getValue()
        },
         maxEditor () {
            this.isMaximum = true
            let dom = document.getElementById("mEditor")
            this.originSize = {
                width: dom.clientWidth,
                height: dom.clientHeight
            }
  
            dom.classList.add('editor-fullscreen')
            this.monacoEditor.layout({
                height: window.screen.height,
                width: document.body.clientWidth
            })
            },
            // 缩小
            minEditor () {
            this.isMaximum = false
            let dom = document.getElementById("mEditor")
            dom.classList.remove('editor-fullscreen')
            this.monacoEditor.layout({
                height: this.originSize.height,
                width: this.originSize.width
            })
        }
    }
}
</script>