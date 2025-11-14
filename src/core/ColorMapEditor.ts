import {ColorMap, ColorMapBin, ColorStop, InterpolationMethod} from './Types';
import {ColorPicker} from './ColorPicker';
import objectAssignDeep from 'object-assign-deep';
import {getColorFromColorMapAt, getColorMapBins} from './convert';
import * as d3Color from 'd3-color';
import {drawControlPoint} from './draw';
import Container from './Container';

/**
 * This creates a color map editor component, where the user can create a color gradient using stops and colors.
 *
 * @example
 *   const cm = new ColorMapEditor("#cm", {
 *     initialColorMap: {
 *       colorStops: [
 *         { stop: 0, color: "#0f0" },
 *         { stop: 0.5, color: "#f00" },
 *         { stop: 1, color: "#000" }
 *       ]
 *     }
 *   });
 *
 *   cm.addListener((colorMapEditor) => {
 *     console.log(colorMapEditor.getColorMap());
 *     // output:
 *     // {
 *     //   colorStops: [{stop: 0, color: "#0f0"},{stop: 0.5, color: "#f00"},{stop: 1, color: "#000"}],
 *     //   interpolationMethod: "HSL_LONG"
 *     // }
 *   });
 */
export class ColorMapEditor extends Container {
  /** This element lays out the canvas and all other controls. */
  private rootElement: HTMLDivElement;

  /** The gradient and stops are painted in here. It also handles mouse input. */
  private canvas: HTMLCanvasElement;

  /** The context for the canvas for convenience. */
  private ctx: CanvasRenderingContext2D;

  /** This is the color map that everything revolves around. The stops are always sorted. */
  private colorStops: ColorStop[];

  /** The used method of interpolation between two color stops. */
  private interpolationMethod: InterpolationMethod;

  /** The size of the control points. Might become configurable in the future. */
  private controlPointSize: number;

  /** If the color map should have a discrete amount of values. */
  private discrete: boolean;

  /** The number of bins. */
  private bins: number;

  /** If true, the numbers under stops get displayed. */
  private showStopNumbers: boolean;

  /** The color picker for editing control point colors is embedded in this div. */
  private colorPickerContainer: HTMLDivElement;

  /** If the interpolation method is set to editable, this element is the selection dropdown. */
  private interpolationMethodElement?: HTMLSelectElement;

  /** If the bins are set to editable, this element shows a checkbox to toggle the discretization. */
  private discreteElement?: HTMLInputElement;

  /** If the bins are set to editable, this element shows a number input field to configure the number of bins. */
  private binsElement?: HTMLInputElement;

  /** The color picker for editing control point colors. */
  private colorPicker: ColorPicker;

  /** This gets called when the color changes to notify users of this library. */
  private callbacks = new Map<number, (colorMapEditor: ColorMapEditor) => void>();
  private callbackCounter = 0;

  /**
   * Creates a new color map editor inside the given container.
   *
   * @param container Either an HTMLElement or a query string to an element, in which the editor will be embedded.
   * @param options   Can be used to configure the color map editor. See {@link ColorMapEditorOptions}.
   */
  constructor(container: HTMLElement | string, options?: ColorMapEditorOptions) {
    super(container);

    // Set all defaults.
    const defaultOptions: ColorMapEditorOptions = {
      initialColorMap: {
        colorStops: [
          {stop: 0, color: 'green'},
          {stop: 0.5, color: 'yellow'},
          {stop: 1, color: 'red'},
        ],
        interpolationMethod: InterpolationMethod.HSL,
        discrete: false,
        bins: 7,
      },
      showStopNumbers: false,
      interpolationMethodsEditable: true,
      binSelectorEditable: true,
      controlPointSize: 7,
    };

    // Merge the options with the defaults.
    // !!! DON'T USE options AND defaultOptions AFTER THIS LINE !!!
    const finalOptions = objectAssignDeep(defaultOptions, options);

    this.colorStops = finalOptions.initialColorMap.colorStops;
    this.sortControlPoints();
    this.showStopNumbers = finalOptions.showStopNumbers;
    this.interpolationMethod = finalOptions.initialColorMap.interpolationMethod;
    this.discrete = finalOptions.initialColorMap.discrete;
    this.bins = finalOptions.initialColorMap.bins;
    this.controlPointSize = finalOptions.controlPointSize;

    this.parent.classList.add('tfe-color-map-editor');

    // This contains the canvas and the controls.
    this.rootElement = document.createElement('div');
    this.rootElement.classList.add('tfe-color-map-editor-root');
    this.rootElement.style.display = 'flex';
    this.rootElement.style.flexDirection = 'column';
    this.rootElement.style.gap = '5px';
    this.parent.appendChild(this.rootElement);

    // Prepare the canvas and the context.
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.parent.clientWidth;
    this.canvas.height = this.parent.clientHeight;

    this.rootElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', {alpha: false});

    // Prepare the container for the color picker and initialize it.
    this.colorPickerContainer = document.createElement('div');
    this.colorPickerContainer.classList.add('tfe-color-map-editor-color-picker-container');
    this.colorPickerContainer.style.width = 'fit-content';
    this.colorPickerContainer.style.padding = '12px';
    this.colorPickerContainer.style.backgroundColor = 'white';
    this.colorPickerContainer.style.border = '1px solid black';
    this.colorPickerContainer.style.visibility = 'hidden';
    this.colorPickerContainer.style.position = 'relative';
    this.parent.appendChild(this.colorPickerContainer);
    this.colorPicker = new ColorPicker(this.colorPickerContainer);

    this.setUpInputElements(finalOptions);

    this.draw();

    // Add all event listeners.
    this.addCanvasEventListeners();
  }

  /** Set new color stops. */
  public setColorStops(colorStops: ColorStop[]) {
    this.colorStops = colorStops;
    this.sortControlPoints();
    this.draw();
    this.sendUpdates();
  }

  /** Get the current color stops. */
  public getColorStops(): ColorStop[] {
    return this.colorStops;
  }

  /** Sets the interpolation method used for interpolating colors between two stops. */
  public setInterpolationMethods(interpolationMethod: InterpolationMethod) {
    this.interpolationMethod = interpolationMethod;

    if (this.interpolationMethodElement) {
      this.interpolationMethodElement.value = this.interpolationMethod;
    }

    this.draw();
    this.sendUpdates();
  }

  /** Get the interpolation method used for interpolating colors between two stops. */
  public getInterpolationMethods(): InterpolationMethod {
    return this.interpolationMethod;
  }

  /**
   * Sets, if the resulting color map is discrete or continuous. If discrete is true, the bins property controls how many
   * bins are shown.
   */
  public setDiscrete(discrete: boolean) {
    this.discrete = discrete;

    if (this.discreteElement) {
      this.binsElement.disabled = !this.discrete;
    }

    this.draw();
    this.sendUpdates();
  }

  /** If the color map is discrete. */
  public isDiscrete(): boolean {
    return this.discrete;
  }

  /** Sets the number of bins, if the color map is discrete. */
  public setBins(bins: number) {
    this.bins = Math.max(bins, 0);

    if (this.binsElement) {
      this.binsElement.valueAsNumber = this.bins;
    }

    this.draw();
    this.sendUpdates();
  }

  /** The number of bins, if the color map is discrete. */
  public getBins(): number {
    return this.bins;
  }

  /** Set a new color map. */
  public setColorMap(colorMap: ColorMap) {
    this.colorStops = colorMap.colorStops;
    this.sortControlPoints();
    this.discrete = colorMap.discrete;
    this.bins = Math.max(colorMap.bins || 0, 0);
    this.interpolationMethod = colorMap.interpolationMethod;

    if (this.discreteElement && this.binsElement) {
      this.discreteElement.checked = this.discrete;
      this.binsElement.valueAsNumber = this.bins;
      this.binsElement.disabled = !this.discrete;
    }

    if (this.interpolationMethodElement) {
      this.interpolationMethodElement.value = this.interpolationMethod;
    }

    this.draw();
    this.sendUpdates();
  }

  /** Get the current color map. */
  public getColorMap(): ColorMap {
    return {
      colorStops: this.colorStops,
      interpolationMethod: this.interpolationMethod,
      discrete: this.discrete || undefined,
      bins: this.discrete ? this.bins : undefined,
    };
  }

  /**
   * This function returns an array of bins with their color, if the color map is discrete. Otherwise, it will return an
   * empty array.
   */
  public getDiscreteColorMap(): ColorMapBin[] {
    return getColorMapBins(this.getColorMap());
  }

  public destroy(): void {
    // 1. Call parent destroy if it exists
    if (super.destroy) {
      super.destroy();
    }

    // 2. Remove input listeners by replacing nodes with clones (safe way to remove event listeners)
    if (this.interpolationMethodElement) {
      this.interpolationMethodElement.replaceWith(this.interpolationMethodElement.cloneNode(true));
      this.interpolationMethodElement = null;
    }

    if (this.discreteElement) {
      this.discreteElement.replaceWith(this.discreteElement.cloneNode(true));
      this.discreteElement = null;
    }

    if (this.binsElement) {
      this.binsElement.replaceWith(this.binsElement.cloneNode(true));
      this.binsElement = null;
    }

    // 3. Clear any internal callbacks
    if (this.callbacks) {
      this.callbacks.clear();
    }

    // 4. Remove canvas and root elements from the DOM
    if (this.canvas) {
      this.removeCanvasEventListeners(); // cleans mousemove, click, resize observers, etc.

      if (this.canvas.parentElement) {
        this.canvas.parentElement.removeChild(this.canvas);
      }

      this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height); // optional
      this.ctx = null;
      this.canvas = null;
    }
    if (this.rootElement?.parentElement) {
      this.rootElement.parentElement.removeChild(this.rootElement);
    }
    this.rootElement = null;

    if (this.colorPickerContainer?.parentElement) {
      this.colorPickerContainer.parentElement.removeChild(this.colorPickerContainer);
    }

    // 5. Destroy the color picker and clear reference
    if (this.colorPicker?.destroy) {
      this.colorPicker.destroy();
    }
    this.colorPicker = null;

    // 6. Null out remaining references
    this.colorPickerContainer = null;
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Register a callback that gets called, when the color map changes. The callback gets called once immediately.
   *
   * @param callback The function that gets called whenever the color map changes.
   */
  public addListener(callback: (colorMapEditor: ColorMapEditor) => void): number {
    const id = this.callbackCounter++;
    this.callbacks.set(id, callback);
    callback(this);
    return id;
  }

  /** Removes the listener with the given id. */
  public removeListener(id: number) {
    this.callbacks.delete(id);
  }

  /** This function notifies all listeners to this color map editor. */
  private sendUpdates() {
    this.callbacks.forEach((value) => value(this));
  }

  private sortControlPoints() {
    this.colorStops.sort((a, b) => a.stop - b.stop);
  }

  /** Draws the gradient and the control points. */
  private draw() {
    // Draw the gradient.
    for (let i = 0; i < this.canvas.width; ++i) {
      this.ctx.fillStyle = getColorFromColorMapAt(
        {
          colorStops: this.colorStops,
          interpolationMethod: this.interpolationMethod,
          discrete: this.discrete,
          bins: this.bins,
        },
        i / (this.canvas.width - 1)
      );

      this.ctx.fillRect(i, 0, 1, this.canvas.height);
    }

    // Draw the control points. To ensure visibility everywhere it is an alternating circle in white and black.
    for (let i = 0; i < this.colorStops.length; i++) {
      const x = this.colorStops[i].stop * this.canvas.width;
      const y = 0.5 * this.canvas.height;
      const color = this.colorStops[i].color;

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.controlPointSize, 0, 2 * Math.PI);
      this.ctx.fill();

      drawControlPoint(this.ctx, x, y, this.controlPointSize);

      // Below the control point we draw the number of the stop, if enabled.
      if (this.showStopNumbers) {
        if (i === 0) {
          this.ctx.textAlign = 'left';
        } else if (i === this.colorStops.length - 1) {
          this.ctx.textAlign = 'right';
        } else {
          this.ctx.textAlign = 'center';
        }

        const brightness = d3Color.hsl(color).l;
        this.ctx.fillStyle = brightness < 0.5 ? 'white' : 'black';
        this.ctx.fillText(this.colorStops[i].stop.toPrecision(3), x, this.canvas.height - 1);
      }
    }
  }

  // Add these properties to your class
  private canvasMouseDownListener: (e: MouseEvent) => void;
  private canvasClickListener: (e: MouseEvent) => void;
  private canvasContextMenuListener: (e: MouseEvent) => void;
  private documentMouseUpListener: (e: MouseEvent) => void;
  private documentMouseMoveListener: (e: MouseEvent) => void;
  private documentClickListener: (e: MouseEvent) => void;
  private colorPickerClickListener: (e: MouseEvent) => void;
  private resizeObserver: ResizeObserver;
  private abortController: AbortController | null = null;
  private isDragging = false;
  private dragIndex = -1;
  private draggedBefore = false;
  private colorPickerListenerId = -1;

  private addCanvasEventListeners() {
    this.draggedBefore = false;
    this.isDragging = false;
    this.dragIndex = -1;
    this.abortController = null;

    const checkDragStart = (e: MouseEvent) => {
      this.dragIndex = -1;
      for (let i = 0; i < this.colorStops.length; i++) {
        const stop = this.colorStops[i];
        const dx = Math.abs(stop.stop * this.canvas.width - e.offsetX);
        if (dx < this.controlPointSize) {
          this.dragIndex = i;
          this.isDragging = true;
          break;
        }
      }

      if (this.isDragging) {
        this.abortController = new AbortController();
        document.addEventListener('mousemove', this.documentMouseMoveListener, {signal: this.abortController.signal});
      }
    };

    // Bound listener for document mousemove
    this.documentMouseMoveListener = (e: MouseEvent) => {
      e.preventDefault();
      if (this.dragIndex > 0 && this.dragIndex < this.colorStops.length - 1) {
        const offsetX = e.clientX - this.canvas.getBoundingClientRect().x;
        const leftBound = this.colorStops[this.dragIndex - 1].stop + Number.EPSILON;
        const rightBound = this.colorStops[this.dragIndex + 1].stop - Number.EPSILON;
        this.colorStops[this.dragIndex].stop = Math.max(leftBound, Math.min(rightBound, offsetX / this.canvas.width));
        this.draw();
        this.sendUpdates();
      }
      this.draggedBefore = true;
    };

    // Mouse down listener
    this.canvasMouseDownListener = (e: MouseEvent) => {
      this.draggedBefore = false;
      if (e.button === 0) {
        checkDragStart(e);
        if (!this.isDragging) {
          // Create new control point
          const x = Math.max(0, Math.min(1, e.offsetX / this.canvas.width));
          const color = getColorFromColorMapAt(
            {
              colorStops: this.colorStops,
              interpolationMethod: this.interpolationMethod,
              discrete: this.discrete,
              bins: this.bins,
            },
            x
          );
          this.colorStops.push({stop: x, color});
          this.sortControlPoints();
          this.draw();
          this.sendUpdates();
          checkDragStart(e);
        }
      } else if (e.button === 2) {
        e.preventDefault();
        for (let i = 1; i < this.colorStops.length - 1; i++) {
          const stop = this.colorStops[i];
          const dx = stop.stop * this.canvas.width - e.offsetX;
          const dy = 0.5 * this.canvas.height - e.offsetY;
          if (Math.sqrt(dx * dx + dy * dy) < this.controlPointSize) {
            this.colorStops.splice(i, 1);
            this.draw();
            this.sendUpdates();
            return;
          }
        }
      }
    };

    // Other bound listeners
    this.canvasClickListener = (e: MouseEvent) => {
      if (this.draggedBefore) return;
      e.stopPropagation();
      let stop = null;
      for (const s of this.colorStops) {
        const dx = Math.abs(s.stop * this.canvas.width - e.offsetX);
        if (dx < this.controlPointSize) {
          stop = s;
          break;
        }
      }

      if (stop) {
        const pageY = this.canvas.height / 2 + this.canvas.getBoundingClientRect().y;
        const viewPortHeight = window.innerHeight;
        const cpHeight = this.colorPickerContainer.clientHeight;
        if (pageY + cpHeight < viewPortHeight) this.colorPickerContainer.style.bottom = `${this.canvas.height / 2}px`;
        else if (pageY - cpHeight > 0)
          this.colorPickerContainer.style.bottom = `${this.canvas.height / 2 + cpHeight}px`;
        else this.colorPickerContainer.style.bottom = `${this.canvas.height / 2 + cpHeight / 2}px`;

        const pageX = stop.stop * this.canvas.width + this.canvas.getBoundingClientRect().x;
        const viewPortWidth = window.innerWidth;
        const cpWidth = this.colorPickerContainer.clientWidth;
        if (pageX + cpWidth < viewPortWidth)
          this.colorPickerContainer.style.left = `${stop.stop * this.canvas.width}px`;
        else if (pageX - cpWidth > 0)
          this.colorPickerContainer.style.left = `${stop.stop * this.canvas.width - cpWidth}px`;
        else this.colorPickerContainer.style.left = `${stop.stop * this.canvas.width - cpWidth / 2}px`;

        this.colorPickerContainer.style.visibility = 'visible';
        this.colorPicker.removeListener(this.colorPickerListenerId);
        this.colorPicker.setHEX(stop.color);
        this.colorPickerListenerId = this.colorPicker.addListener((cp) => {
          stop.color = cp.getHEX();
          this.draw();
          this.sendUpdates();
        });
      }
    };

    this.canvasContextMenuListener = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    this.documentMouseUpListener = () => {
      if (this.isDragging && this.abortController) {
        this.abortController.abort();
        this.abortController = null;
        this.isDragging = false;
        this.dragIndex = -1;
      }
    };

    this.documentClickListener = () => {
      this.colorPickerContainer.style.visibility = 'hidden';
    };

    this.colorPickerClickListener = (e: MouseEvent) => e.stopPropagation();

    // Add listeners
    this.canvas.addEventListener('mousedown', this.canvasMouseDownListener);
    this.canvas.addEventListener('click', this.canvasClickListener);
    this.canvas.addEventListener('contextmenu', this.canvasContextMenuListener);
    this.colorPickerContainer.addEventListener('click', this.colorPickerClickListener);
    document.addEventListener('mouseup', this.documentMouseUpListener);
    document.addEventListener('click', this.documentClickListener);

    // ResizeObserver
    this.resizeObserver = new ResizeObserver(() => {
      this.canvas.width = this.parent.clientWidth;
      this.canvas.height = this.parent.clientHeight;
      this.draw();
    });
    this.resizeObserver.observe(this.parent);
  }

  // Removes all canvas-related listeners and observers
  private removeCanvasEventListeners() {
    if (!this.canvas) return;

    this.canvas.removeEventListener('mousedown', this.canvasMouseDownListener);
    this.canvas.removeEventListener('click', this.canvasClickListener);
    this.canvas.removeEventListener('contextmenu', this.canvasContextMenuListener);

    document.removeEventListener('mouseup', this.documentMouseUpListener);
    document.removeEventListener('click', this.documentClickListener);

    if (this.colorPickerContainer) {
      this.colorPickerContainer.removeEventListener('click', this.colorPickerClickListener);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.isDragging = false;
    this.dragIndex = -1;
    this.draggedBefore = false;
  }

  /**
   * Depending on the users options this method creates a dropdown for selecting the interpolation method, a checkbox
   * for toggling if the color map is discrete and a number input for the number of bins.
   */
  private setUpInputElements(finalOptions) {
    // If no controls are enabled we don't add anything to the DOM.
    if (!finalOptions.interpolationMethodsEditable && !finalOptions.binSelectorEditable) {
      return;
    }

    // The root of the inputs. It aligns them horizontally and wraps them if needed.
    const settingsContainer = document.createElement('div');
    settingsContainer.classList.add('tfe-color-map-editor-settings');
    settingsContainer.style.display = 'flex';
    settingsContainer.style.flexDirection = 'row';
    settingsContainer.style.justifyContent = 'space-between';
    settingsContainer.style.alignItems = 'center';
    settingsContainer.style.flexWrap = 'wrap';
    this.rootElement.appendChild(settingsContainer);

    if (finalOptions.interpolationMethodsEditable) {
      const label = document.createElement('label');
      label.classList.add('tfe-color-map-editor-interpolation-method-label');
      label.innerText = 'Interpolation: ';

      this.interpolationMethodElement = document.createElement('select');
      this.interpolationMethodElement.classList.add('tfe-color-map-editor-interpolation-method-select');

      // Generate options for all interpolation methods.
      for (const method of Object.keys(InterpolationMethod)) {
        const option = document.createElement('option');
        option.classList.add('tfe-color-map-editor-interpolation-method-option');
        option.value = method;
        option.innerText = method.replace('_', ' ');
        this.interpolationMethodElement.options.add(option);
      }

      this.interpolationMethodElement.value = this.interpolationMethod;

      this.interpolationMethodElement.addEventListener('change', () => {
        this.interpolationMethod = InterpolationMethod[this.interpolationMethodElement.value];
        this.draw();
        this.sendUpdates();
      });

      label.appendChild(this.interpolationMethodElement);
      settingsContainer.appendChild(label);
    }

    if (finalOptions.binSelectorEditable) {
      const binSelectorRoot = document.createElement('div');
      binSelectorRoot.classList.add('tfe-color-map-editor-bin-selector');
      binSelectorRoot.style.display = 'flex';
      binSelectorRoot.style.flexDirection = 'row';
      binSelectorRoot.style.gap = '10px';
      binSelectorRoot.style.alignItems = 'center';
      settingsContainer.appendChild(binSelectorRoot);

      const checkboxLabel = document.createElement('label');
      checkboxLabel.classList.add('tfe-color-map-editor-bin-selector-checkbox-label');
      checkboxLabel.innerText = 'discrete: ';
      binSelectorRoot.appendChild(checkboxLabel);

      this.discreteElement = document.createElement('input');
      this.discreteElement.classList.add('tfe-color-map-editor-bin-selector-checkbox');
      this.discreteElement.type = 'checkbox';
      this.discreteElement.checked = this.discrete;
      checkboxLabel.appendChild(this.discreteElement);

      const binsLabel = document.createElement('label');
      binsLabel.classList.add('tfe-color-map-editor-bin-selector-number-label');
      binsLabel.innerText = 'bins: ';
      binSelectorRoot.appendChild(binsLabel);

      this.binsElement = document.createElement('input');
      this.binsElement.classList.add('tfe-color-map-editor-bin-selector-number-input');
      this.binsElement.style.width = '50px';
      this.binsElement.disabled = !this.discrete;
      this.binsElement.type = 'number';
      this.binsElement.min = '0';
      this.binsElement.step = '1';
      this.binsElement.valueAsNumber = this.bins;

      this.discreteElement.addEventListener('change', () => {
        this.discrete = this.discreteElement.checked;
        this.binsElement.disabled = !this.discrete;

        this.draw();
        this.sendUpdates();
      });

      this.binsElement.addEventListener('change', () => {
        this.bins = this.binsElement.valueAsNumber;

        this.draw();
        this.sendUpdates();
      });

      // Add scroll wheel support to the number input.
      this.binsElement.addEventListener('wheel', (ev: WheelEvent) => {
        ev.preventDefault();

        let value = this.binsElement.valueAsNumber;
        if (ev.deltaY > 0) {
          // Decrement
          value = Math.max(value - 1, 0);
        } else if (ev.deltaY < 0) {
          // Increment
          value = Math.max(value + 1, 0);
        }

        this.binsElement.valueAsNumber = Math.round(value);
        this.bins = this.binsElement.valueAsNumber;

        this.draw();
        this.sendUpdates();
      });

      // Ensure that all user inputs are properly handled. For example empty and negative input.
      const validateBins = (ev: Event) => {
        const el = ev.currentTarget as HTMLInputElement;
        if (!el.valueAsNumber || el.valueAsNumber < 0) {
          el.valueAsNumber = 0;
          this.bins = this.binsElement.valueAsNumber;
        }

        this.draw();
        this.sendUpdates();
      };

      this.binsElement.addEventListener('focusout', validateBins);
      this.binsElement.addEventListener('keypress', (ev: KeyboardEvent) => {
        if (ev.key === 'Enter') {
          validateBins(ev);
        }
      });

      binsLabel.appendChild(this.binsElement);
    }
  }
}

/**
 * The config options for the {@link ColorMapEditor} component.
 */
export interface ColorMapEditorOptions {
  initialColorMap?:
    | {
        /**
         * The initial color map.
         * Default:
         * [
         *   { stop: 0, color: "green" },
         *   { stop: 0.5, color: "yellow" },
         *   { stop: 1, color: "red" }
         * ]
         */
        colorStops?: ColorStop[];

        /**
         * The method of interpolation.
         * Default: "HSL_LONG"
         */
        interpolationMethod?: InterpolationMethod;

        /**
         * If the color map is discrete or continuous.
         * Default: false
         */
        discrete?: boolean;

        /**
         * The number of bins in case the color map is continuous.
         * Default: 7
         */
        bins?: number;
      }
    | ColorMap;

  /**
   * If the value of a stop is rendered below the control point.
   * Default: false
   */
  showStopNumbers?: boolean;

  /**
   * If a dropdown with different interpolation methods is shown.
   * Default: true
   */
  interpolationMethodsEditable?: boolean;

  /**
   * If settings for a discrete color map are shown.
   * Default: true
   */
  binSelectorEditable?: boolean;

  /**
   * The size of control points in pixel.
   * Default: 7
   */
  controlPointSize?: number;
}
