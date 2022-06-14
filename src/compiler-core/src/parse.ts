import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any = [];

  let node;
  const s = context.source;
  // 如果是插值表达式
  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }
  // 以上两种方式都无法解析，则为文本
  if (!node) {
    node = parseText(context);
  }

  nodes.push(node);

  return nodes;
}

function parseText(context) {
  const content = parseTextData(context, context.source.length);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context, length) {
  const rawText = context.source.slice(0, length);
  advanceBy(context, length); // 取值之后，直接推进
  return rawText;
}

function parseElement(context) {
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);

  return element;
}

function parseTag(context, type: TagType) {
  // 解析 tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source); // 正则匹配 <开头或者 </ 开头的标签
  const tag = match[1];
  // 推进(删除)已处理的代码
  advanceBy(context, match[0].length);
  advanceBy(context, 1); // 推进1位，去掉 >

  if (type === TagType.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
}

function parseInterpolation(context) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  ); // 闭合的索引
  advanceBy(context, openDelimiter.length); // 推进2位，去掉 {{

  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = parseTextData(context, rawContentLength); // 所要获取的内容
  const content = rawContent.trim(); // 修复表达式前后存在空格的边缘情况
  advanceBy(context, closeDelimiter.length); // 继续推进到 }} 之后的位置

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}

/**
 * @param context 被推进的内容
 * @param length 推进的步数
 */
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
  };
}

function createParseContext(content: string): any {
  return {
    source: content,
  };
}
