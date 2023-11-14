export const templatePlaceOrder = document.createElement('template');
templatePlaceOrder.innerHTML = `
  <div class="row">
    <h2 class="col-12 display-4">Place order - prrrt</h2>
  </div>
  <div class="row">
    <table class="table col-12">
      <thead>
        <tr>
          <th>Drink</th>
          <th colspan="2">Price</th>
        </tr>
      </thead>
      <tbody class="roboOrderTableBody">
      </tbody>
      <tfoot>
        <tr>
          <th>Total</th>
          <th class="roboTotalPrice"></th>
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="row">
    <div class="col-12">
      <button
        class="btn btn-success roboSubmit"
        type="submit"
      >
        Submit order
      </button>
    </div>
  </div>
  <div class="row">
    <div class="col-12">&nbsp;</div>
  </div>
`;

export const templateOrderRow = document.createElement('template');
templateOrderRow.innerHTML = `<tr>
  <td class="roboName"></td>
  <td class="roboPrice"></td>
  <td>
    <div class="row">
      <div class="col-5">
        <div class="input-group">
          <div class="input-group-prepend">
            <button class="btn btn-dark roboDecrement">-</button>
          </div>
          <input class="form-control roboAmount" type="number" readonly />
          <div class="input-group-append">
            <button class="btn btn-dark roboIncrement">+</button>
          </div>
        </div>
      </div>
    </div>
  </td>
</tr>`;
