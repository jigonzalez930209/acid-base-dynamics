import katex from 'katex';
import 'katex/dist/contrib/mhchem.mjs';

try {
  console.log(String.raw`\ce{H3PO4}`);
  console.log(katex.renderToString(String.raw`\ce{H3PO4}`, { throwOnError: true }));
  console.log('SUCCESS!');
} catch (e) {
  console.error('FAIL:', e.message);
}
