# ColorMappingEditor (React + vtk.js Integration)

Fork of the [DLR Transfer Function Editor](https://github.com/DLR-SC/transfer-function-editor). Original library is based on d3.

A fork is created to develop React components that integrate with vtk.js for 3D visualization applications.

## Components

### Color Picker

![ColorPicker](docs/images/ColorPicker.png)

The color picker component allows to choose a color with a hue, saturation value picker. It also provides input via
input fields for hsv, rgb and hex.

### Color Map Editor

![ColorMapContinuous](docs/images/ColorMapContinuous.png)
![ColorMapDiscrete](docs/images/ColorMapDiscrete.png)

The color map editor allows creation of discrete and continuous color maps with different interpolation methods.

### Transparency Editor

![TransparencyEditor](docs/images/TransparencyEditor.png)

The transparency editor allows to create functions that map transparency onto values.

### Transfer Function Editor

![Teaser](docs/images/Teaser.png)

This component brings all previous components together to create a powerful tool for managing all possible transfer
functions.
