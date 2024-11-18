import { Component } from '@angular/core';

@Component({
  selector: 'app-category',
  template: `
    <div style="display: flex; justify-content: space-between; align-items: end; width: 1504px; height: 543px">
      <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 80px; width: 542px; height: 489px">
        <div style="display: flex; justify-content: center; align-items: center; width: 357px; height: 357px">
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 331.3px; height: 331.3px; background-image: url('/assets/SvgAsset9.svg')">
            <div style="font-family: 'Work Sans', sans-serif; font-size: 37px; width: 241px; color: rgba(101,42,113,1); line-height: 100%; font-weight: 600">
              10% off<br />for premium <br />members
            </div>
          </div>
        </div>
        <div style="font-family: 'Work Sans', sans-serif; font-size: 22px; width: 542px; color: rgba(101,42,113,1); line-height: 100%; font-weight: 400">
          great deals on top brands, exclusively for members! Join premium today.
        </div>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 45px; width: 378px; height: 368px">
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 378px; height: 297px; background-image: url('/assets/SvgAsset7.svg')">
          <div style="font-family: 'Work Sans', sans-serif; font-size: 50px; white-space: nowrap; color: rgba(101,42,113,1); line-height: 100%; font-weight: 700">
            Skincare
          </div>
        </div>
        <div style="font-family: 'Work Sans', sans-serif; font-size: 22.5px; white-space: nowrap; text-decoration: underline; color: rgba(101,42,113,1); line-height: 100%; font-weight: 700">
          <span style="text-decoration: underline">View All</span>
        </div>
      </div>
    </div>
  `
})
export class CategoryComponent {}
