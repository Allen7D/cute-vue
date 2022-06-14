import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any = [];

  let node;
  // 如果是插值表达式
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  }

  nodes.push(node);

  return nodes;
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
  const rawContent = context.source.slice(0, rawContentLength); // 所要获取的内容
  const content = rawContent.trim(); // 修复表达式前后存在空格的边缘情况
  advanceBy(context, rawContentLength + closeDelimiter.length); // 继续推进到 }} 之后的位置

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
