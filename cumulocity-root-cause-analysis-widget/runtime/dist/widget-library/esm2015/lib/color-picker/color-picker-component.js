/**
 * Copyright (c) 2020 Software AG, Darmstadt, Germany and/or its licensors
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Component, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
export class ColorPickerComponent {
    constructor(eRef) {
        this.eRef = eRef;
        this.colorSet = new EventEmitter(true);
        this.closeColorPicker = new EventEmitter();
    }
    applyColorClicked() {
        if (this.color !== undefined) {
            if (this.colorType === 'hexa') {
                this.colorSet.emit(this.RGBAToHexA(this.color));
            }
            else {
                this.colorSet.emit(this.color);
            }
        }
    }
    RGBAToHexA(rgba) {
        const sep = rgba.indexOf(',') > -1 ? ',' : ' ';
        rgba = rgba.substr(5).split(')')[0].split(sep);
        // Strip the slash if using space-separated syntax
        if (rgba.indexOf('/') > -1) {
            rgba.splice(3, 1);
        }
        let r = (+rgba[0]).toString(16);
        let g = (+rgba[1]).toString(16);
        let b = (+rgba[2]).toString(16);
        let a = Math.round(+rgba[3] * 255).toString(16);
        if (r.length === 1) {
            r = '0' + r;
        }
        if (g.length === 1) {
            g = '0' + g;
        }
        if (b.length === 1) {
            b = '0' + b;
        }
        if (a.length === 1) {
            a = '0' + a;
        }
        return '#' + r + g + b + a;
    }
    onClick(event) {
        if (this.eRef.nativeElement.contains(event.target) ||
            (event.target.attributes.id &&
                (event.target.attributes.id.nodeValue === 'colorInput' ||
                    event.target.attributes.id.nodeValue === 'colorInputBorder'))) {
        }
        else {
            this.closeColorPicker.emit(false);
        }
    }
}
ColorPickerComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line: component-selector
                selector: 'app-color-picker',
                template: "<!-- <mat-radio-group aria-label=\"Select an option\" (change) =\"colorType = $event.value\" >\n  <mat-radio-button  checked=\"true\" value=\"rgba\">RGBA</mat-radio-button>\n  <mat-radio-button value=\"hexa\">HEXA</mat-radio-button>\n</mat-radio-group> -->\n<div class=\"form-group\">\n  <label class=\"c8y-radio radio-inline\">\n    <input\n      type=\"radio\"\n      checked=\"checked\"\n      value=\"rgba\"\n      name=\"color-radio-group\"\n      (change)=\"colorType = $event.value\"\n    />\n    <span></span>\n    <span> RGBA </span>\n  </label>\n  <label class=\"c8y-radio radio-inline\">\n    <input type=\"radio\" value=\"hexa\" name=\"color-radio-group\" (change)=\"colorType = $event.value\" />\n    <span></span>\n    <span> HEXA</span>\n  </label>\n</div>\n<div class=\"color-wrapper\">\n  <app-color-palette [hue]=\"hue\" (color)=\"color = $event\"></app-color-palette>\n  <app-color-slider (color)=\"hue=$event\" style=\"margin-left: 16px\"></app-color-slider>\n  <div class=\"colorPickerFooter\">\n    <button class=\"btn btn-default\" style=\"margin-bottom: 5px\">Cancel</button>\n    <br />\n    <button class=\"btn btn-primary\" (click)=\"applyColorClicked()\">Apply</button>\n  </div>\n</div>\n<!-- <div class=\"input-wrapper\">\n    <span class=\"text\">{{color}}</span>\n    <div\n      class=\"color-div\"\n      [ngStyle]=\"{'background-color': color || 'white'}\"\n    ></div>\n  </div> -->\n",
                styles: [":host{display:block;width:316px;padding:16px}.color-wrapper{display:flex;height:150px}.input-wrapper{margin-top:16px;display:flex;border-radius:1px;border:1px solid #dcdcdc;padding:8px;height:32px;justify-content:center}.color-div{width:32px;height:32px;border-radius:50%;border:1px solid #dcdcdc}.text{flex:1;font-family:Helvetica;line-height:32px}.colorPickerFooter{padding:14px;text-align:center;box-shadow:inset 0 1px 0 rgba(0,0,0,.05)}"]
            },] }
];
ColorPickerComponent.ctorParameters = () => [
    { type: ElementRef }
];
ColorPickerComponent.propDecorators = {
    colorSet: [{ type: Output }],
    closeColorPicker: [{ type: Output }],
    onClick: [{ type: HostListener, args: ['document:click', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItcGlja2VyLWNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2dwLWxpYi1yY2Evc3JjL2xpYi9jb2xvci1waWNrZXIvY29sb3ItcGlja2VyLWNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBUTFGLE1BQU0sT0FBTyxvQkFBb0I7SUFNL0IsWUFBb0IsSUFBZ0I7UUFBaEIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUwxQixhQUFRLEdBQXlCLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hELHFCQUFnQixHQUEwQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBSWhDLENBQUM7SUFDeEMsaUJBQWlCO1FBQ2YsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUM1QixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssTUFBTSxFQUFFO2dCQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ2pEO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoQztTQUNGO0lBQ0gsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFTO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQy9DLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFL0Msa0RBQWtEO1FBQ2xELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNuQjtRQUVELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEIsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDYjtRQUNELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEIsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDYjtRQUNELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEIsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDYjtRQUNELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEIsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDYjtRQUVELE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBR0QsT0FBTyxDQUFDLEtBQVU7UUFDaEIsSUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUM5QyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3pCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFNBQVMsS0FBSyxZQUFZO29CQUNwRCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsU0FBUyxLQUFLLGtCQUFrQixDQUFDLENBQUMsRUFDakU7U0FDRDthQUFNO1lBQ0wsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuQztJQUNILENBQUM7OztZQWhFRixTQUFTLFNBQUM7Z0JBQ1QsK0NBQStDO2dCQUMvQyxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1Qix3NUNBQTRDOzthQUU3Qzs7O1lBUHVELFVBQVU7Ozt1QkFTL0QsTUFBTTsrQkFDTixNQUFNO3NCQTZDTixZQUFZLFNBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAyMCBTb2Z0d2FyZSBBRywgRGFybXN0YWR0LCBHZXJtYW55IGFuZC9vciBpdHMgbGljZW5zb3JzXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHsgQ29tcG9uZW50LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgSG9zdExpc3RlbmVyLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ2FwcC1jb2xvci1waWNrZXInLFxuICB0ZW1wbGF0ZVVybDogJy4vY29sb3ItcGlja2VyLWNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vY29sb3ItcGlja2VyLWNvbXBvbmVudC5jc3MnXSxcbn0pXG5leHBvcnQgY2xhc3MgQ29sb3JQaWNrZXJDb21wb25lbnQge1xuICBAT3V0cHV0KCkgY29sb3JTZXQ6IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcih0cnVlKTtcbiAgQE91dHB1dCgpIGNsb3NlQ29sb3JQaWNrZXI6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgcHVibGljIGh1ZSE6IHN0cmluZztcbiAgcHVibGljIGNvbG9yITogc3RyaW5nO1xuICBwdWJsaWMgY29sb3JUeXBlOiBhbnk7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZVJlZjogRWxlbWVudFJlZikge31cbiAgYXBwbHlDb2xvckNsaWNrZWQoKSB7XG4gICAgaWYgKHRoaXMuY29sb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHRoaXMuY29sb3JUeXBlID09PSAnaGV4YScpIHtcbiAgICAgICAgdGhpcy5jb2xvclNldC5lbWl0KHRoaXMuUkdCQVRvSGV4QSh0aGlzLmNvbG9yKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbG9yU2V0LmVtaXQodGhpcy5jb2xvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgUkdCQVRvSGV4QShyZ2JhOiBhbnkpIHtcbiAgICBjb25zdCBzZXAgPSByZ2JhLmluZGV4T2YoJywnKSA+IC0xID8gJywnIDogJyAnO1xuICAgIHJnYmEgPSByZ2JhLnN1YnN0cig1KS5zcGxpdCgnKScpWzBdLnNwbGl0KHNlcCk7XG5cbiAgICAvLyBTdHJpcCB0aGUgc2xhc2ggaWYgdXNpbmcgc3BhY2Utc2VwYXJhdGVkIHN5bnRheFxuICAgIGlmIChyZ2JhLmluZGV4T2YoJy8nKSA+IC0xKSB7XG4gICAgICByZ2JhLnNwbGljZSgzLCAxKTtcbiAgICB9XG5cbiAgICBsZXQgciA9ICgrcmdiYVswXSkudG9TdHJpbmcoMTYpO1xuICAgIGxldCBnID0gKCtyZ2JhWzFdKS50b1N0cmluZygxNik7XG4gICAgbGV0IGIgPSAoK3JnYmFbMl0pLnRvU3RyaW5nKDE2KTtcbiAgICBsZXQgYSA9IE1hdGgucm91bmQoK3JnYmFbM10gKiAyNTUpLnRvU3RyaW5nKDE2KTtcblxuICAgIGlmIChyLmxlbmd0aCA9PT0gMSkge1xuICAgICAgciA9ICcwJyArIHI7XG4gICAgfVxuICAgIGlmIChnLmxlbmd0aCA9PT0gMSkge1xuICAgICAgZyA9ICcwJyArIGc7XG4gICAgfVxuICAgIGlmIChiLmxlbmd0aCA9PT0gMSkge1xuICAgICAgYiA9ICcwJyArIGI7XG4gICAgfVxuICAgIGlmIChhLmxlbmd0aCA9PT0gMSkge1xuICAgICAgYSA9ICcwJyArIGE7XG4gICAgfVxuXG4gICAgcmV0dXJuICcjJyArIHIgKyBnICsgYiArIGE7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDpjbGljaycsIFsnJGV2ZW50J10pXG4gIG9uQ2xpY2soZXZlbnQ6IGFueSkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuZVJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgfHxcbiAgICAgIChldmVudC50YXJnZXQuYXR0cmlidXRlcy5pZCAmJlxuICAgICAgICAoZXZlbnQudGFyZ2V0LmF0dHJpYnV0ZXMuaWQubm9kZVZhbHVlID09PSAnY29sb3JJbnB1dCcgfHxcbiAgICAgICAgICBldmVudC50YXJnZXQuYXR0cmlidXRlcy5pZC5ub2RlVmFsdWUgPT09ICdjb2xvcklucHV0Qm9yZGVyJykpXG4gICAgKSB7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xvc2VDb2xvclBpY2tlci5lbWl0KGZhbHNlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==