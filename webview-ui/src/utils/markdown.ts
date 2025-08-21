import MarkdownIt from "markdown-it";

// Configure markdown-it instance
const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: false, // Disable automatic URL conversion (too aggressive)
  typographer: true, // Enable some language-neutral replacement + quotes beautification
});

export const renderMarkdown = (content: string): string => {
  return md.render(content);
};

export default md;
