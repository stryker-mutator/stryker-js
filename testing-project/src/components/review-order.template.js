export const reviewOrderTemplate = document.createElement('template');
reviewOrderTemplate.innerHTML = `<div class="row">
    <h2 class="col-12 display-4">
      Order review
      <small class="text-muted"
        >- <span class="roboTotalAmount"></span>
      ></small>
    </h2>
  </div>
  <div class="row">
    <div class="col-12">
      <div class="roboAlert alert alert-danger" role="alert">
        <h4 class="alert-heading">Prrt!</h4>
        <p class="roboAlertText"></p>
      </div>
    </div>
    <div class="col-12">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Drink</th>
            <th>#</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody class="roboReviewTableBody"></tbody>
      </table>
      <form class="roboSubmitForm ">
        <div class="roboAgeCheck form-group row">
          <label for="ageInput" class="col-2 col-form-label">Age</label
          >
          <div class="col-2">
            <input
              type="number"
              class="form-control form-control-lg"
              id="ageInput"
            />
          </div>
        </div>
        <button class="roboCancel btn btn-default" type="button">
          Cancel
        </button>
        <button
          class="roboSubmit btn btn-success"
          type="submit"
        >
          Order
        </button>
      </form>
    </div>
  </div>`;

export const reviewRowTemplate = document.createElement('template');
reviewRowTemplate.innerHTML = `<tr>
  <td>
    <em class="roboName"></em>
  </td>
  <td class="roboAmount"></td>
  <td class="roboPricePerDrink"></td>
  <td class="roboPrice"></td>
</tr>`;
