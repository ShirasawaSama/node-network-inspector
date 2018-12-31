import highlight from 'highlight.js'
import { format } from 'prettier/standalone'
import * as html from 'prettier/parser-html'
import * as css from 'prettier/parser-postcss'
import * as babylon from 'prettier/parser-babylon'
import * as graphql from 'prettier/parser-graphql'

const OPTIONS = { plugins: [babylon, graphql, html, css], semi: false }
const types = ['json5', 'babylon', 'graphql', 'html', 'css']
const formatCode = (code: string): string => {
  for (const parser of types) try { return format(code, { ...OPTIONS, parser }) } catch (e) { }
  return code
}

self.addEventListener('message', ({ data }) => {
  const formated = formatCode(data).replace(/[\n\r]+$/, '')
  ;(self as any).postMessage({ formated, originHL: highlight.highlightAuto(data).value,
    formatedHL: highlight.highlightAuto(formated).value })
})
