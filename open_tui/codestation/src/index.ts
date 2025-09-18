
import {
  createCliRenderer,
  ASCIIFontRenderable, RGBA,
  TextRenderable, t, bold, fg, underline
} from "@opentui/core"

import { BoxRenderable } from "@opentui/core"

const main = async () => {
  const renderer = await createCliRenderer({ exitOnCtrlC: true }); 

  const title = new ASCIIFontRenderable(renderer, {
    id: "title",
    text: "OPENTUI",
    font: "tiny",
    fg: RGBA.fromInts(255, 255, 255, 255),
    position: "absolute",
    left: 10,
    top: 2,
  }) 

 /*  const plainText = new TextRenderable(renderer, {
    id: "plain-text",
    content: "Important Message",
    fg: "#FFFF00",
    position: "absolute",
    left: 5,
    top: 2,
  }) */

  const styledTextRenderable = new TextRenderable(renderer, {
    id: "styled-text",
    content: t`${bold("Important Message")} ${fg("#FF0000")(underline("Important Message"))}`,
    position: "absolute",
    right: 50,
    left: 50,
    top: 3,
  })

  const leftPanel = new BoxRenderable(renderer, {
    id: "left-panel",
    width: 25,
    height: 15,
    backgroundColor: "#336633",
    borderStyle: "double",
    borderColor: "#FFFFFF",
    title: "Inbox",
    titleAlignment: "center",
    position: "absolute",
    left: 2,
    top: 8,
  })

  const rightPanel = new BoxRenderable(renderer, {
    id: "right-panel", 
    width: 25,
    height: 15,
    backgroundColor: "#663333",
    borderStyle: "double",
    borderColor: "#FFFFFF",
    title: "Active Projects",
    titleAlignment: "center",
    position: "absolute",
    right: 5,
    top: 8,
  })

  const panel = new BoxRenderable(renderer, {
    id: "panel",
    width: 30,
    height: 10,
    backgroundColor: "#333366",
    borderStyle: "double",
    borderColor: "#FFFFFF",
    title: "Settings Panel",
    titleAlignment: "center",
    position: "absolute",
    left: 50,
    top: 5,
  })

  renderer.root.add(title);
//  renderer.root.add(plainText);
  renderer.root.add(styledTextRenderable);
  renderer.root.add(leftPanel);
  renderer.root.add(rightPanel);
  renderer.root.add(panel);

  // The library might handle rendering automatically once elements are added.
  // No explicit render() call or interval loop is needed based on documentation.
  }

main();
