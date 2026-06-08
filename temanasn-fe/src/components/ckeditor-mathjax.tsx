// import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
// import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
// import Command from '@ckeditor/ckeditor5-core/src/command';

// class InsertMathJaxCommand extends Command {
//   execute(value: string) {
//     const editor = this.editor;

//     editor.model.change((writer) => {
//       const insertPosition = editor.model.document.selection.getFirstPosition();
//       const mathJaxElement = writer.createElement('mathjax', { value });

//       editor.model.insertContent(mathJaxElement, insertPosition);
//     });
//   }

//   refresh() {
//     const model = this.editor.model;
//     const selection = model.document.selection;
//     const isAllowed = model.schema.checkChild(
//       selection.focus!.parent!,
//       'mathjax'
//     );

//     this.isEnabled = isAllowed;
//   }
// }

// class MyMathJaxPlugin extends Plugin {
//   static get pluginName() {
//     return 'MyMathJaxPlugin';
//   }

//   init() {
//     const editor = this.editor;

//     editor.model.schema.register('mathjax', {
//       allowWhere: '$text',
//       isInline: true,
//       isObject: true,
//       allowAttributes: ['value'],
//     });

//     editor.conversion.for('dataDowncast').elementToElement({
//       model: 'mathjax',
//       view: (modelItem, viewWriter) => {
//         const value = modelItem.getAttribute('value');
//         const span = viewWriter.createContainerElement('span', {
//           class: 'math-tex',
//         });
//         viewWriter.insert(
//           viewWriter.createPositionAt(span, 0),
//           viewWriter.createText(value)
//         );
//         return span;
//       },
//     });

//     editor.conversion.for('dataUpcast').elementToElement({
//       view: {
//         name: 'span',
//         classes: 'math-tex',
//       },
//       model: (viewElement, modelWriter) => {
//         const value = viewElement.getChild(0).data;
//         return modelWriter.createElement('mathjax', { value });
//       },
//     });

//     editor.commands.add('insertMathJax', new InsertMathJaxCommand(editor));

//     editor.ui.componentFactory.add('Mathjax', (locale) => {
//       const view = new ButtonView(locale);

//       view.set({
//         label: 'Insert MathJax',
//         withText: true,
//         tooltip: true,
//       });

//       view.on('execute', () => {
//         const value = prompt('Enter LaTeX equation');
//         if (value) {
//           editor.execute('insertMathJax', value);
//         }
//       });

//       return view;
//     });

//     editor.on('change:data', () => {
//       setTimeout(() => {
//         window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
//       }, 0);
//     });
//   }
// }

// export default MyMathJaxPlugin;
