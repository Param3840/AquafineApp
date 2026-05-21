Put all product bottle images in this folder.

Recommended file names:

- 1000ml-premium.png
- 500ml-premium.png
- 1000ml-square.png
- 500ml-square.png
- 200ml-square.png

After adding an image, open `src/screens/HomeScreen.js` and add/uncomment the matching image line inside `bottles`:

```js
image: require("../../assets/products/1000ml-premium.png"),
```

Use PNG images with transparent backgrounds for the best card UI.
