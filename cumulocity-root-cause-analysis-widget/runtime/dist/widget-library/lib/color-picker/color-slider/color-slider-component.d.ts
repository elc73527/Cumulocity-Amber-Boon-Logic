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
import { ElementRef, EventEmitter } from '@angular/core';
export declare class ColorSliderComponent {
    color: EventEmitter<string>;
    canvas: ElementRef<HTMLCanvasElement>;
    private ctx;
    private mousedown;
    private selectedHeight;
    ngAfterViewInit(): void;
    onMouseDown(evt: MouseEvent): void;
    onMouseMove(evt: MouseEvent): void;
    onMouseUp(evt: MouseEvent): void;
    emitColor(x: number, y: number): void;
    getColorAtPosition(x: number, y: number): string;
    draw(): void;
}
