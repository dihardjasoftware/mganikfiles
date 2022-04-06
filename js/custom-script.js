// NOTE: script init.
const BASE_STORAGE_URL = "https://api.mganik.com/api/v1";
let distributorData = [];
let brandData = {};

$(document).ready(function () {
 getDistributors(brand_name);
});

function getDistributors(brand) {
 const url = BASE_STORAGE_URL + "/distributors";
 let config = {
  headers: {
   brand: brand,
  },
 };
 axios
  .get(url, config)
  .then((response) => {
   let responseData = response["data"]["data"];
   parseJSONtoHTML(responseData);
   dataList(responseData);
   this.distributorData = responseData.distributors;
   this.brandData = responseData.brand;
   setColor(this.brandData);
  })
  .catch((error) => {
   console.log("error", error);
  });
}

function parseJSONtoHTML(data) {
 this.brandData = data.brand;
 // Province list
 let list = data.distributors.map((items) => {
  // City list
  var sub = items.cities.map((itms) => {
   // Distributor list
   var district = itms.distributors.map((itm) => {
    // distributor cards
    return `<li>${distributorCards(items.name, itms.name, itm)}</li>`;
   });
   // second-level accordion
   return `<li class="has-children"><div class="acnav__label acnav__label--level2" style="color: ${
    this.brandData.titleColor
   }; background-color: ${this.brandData.secondaryColor};">${
    itms.name
   }</div><ul class="acnav__list acnav__list--level3">${district.join(
    ""
   )}</ul></li>`;
  });
  // first-level accordion
  return `<li class="has-children"><div class="acnav__label parent" style="color: ${
   this.brandData.titleColor
  }; background-color: ${this.brandData.secondaryColor};">${
   items.name
  }</div><ul class="acnav__list acnav__list--level2">${sub.join("")}</ul></li>`;
 });

 $("#distributor__level1").html(list.join(""));
 handleAccordionClick();
}

let options = [];
function dataList(data) {
 const result = data.distributors.reduce((arr, currentProvince) => {
  // iterate over the second level array
  (currentProvince?.cities || []).forEach((city) => {
   // iterate over the third level array
   //  (city?.distributors || []).forEach((distributor) => {
   //   // push the value into the result array,
   //   arr.push({
   //    provinceId: currentProvince?.id || "",
   //    cityId: city?.id || "",
   //    districtId: distributor?.district?.id || "",
   //    label: `${currentProvince?.name || "[PROVINCE_NAME]"} > ${
   //     city?.name || "[CITY_NAME]"
   //    }`,
   //   });
   //  });
   arr.push({
    provinceId: currentProvince?.id || "",
    cityId: city?.id || "",
    // districtId: distributor?.district?.id || "",
    label: `${currentProvince?.name || "[PROVINCE_NAME]"} > ${
     city?.name || "[CITY_NAME]"
    }`,
   });
  });
  // return the array reference for the next iteration
  return arr;

  // set the initial value as an array for the result
 }, []);
 //then, remove duplicate item because there may be more than one distributor in the same district
 this.options = result.filter(
  (value, index, self) =>
   index === self.findIndex((t) => t.cityId === value.cityId)
 );
}

//Handlechange input
let arraySearch = [];
function searchData(value) {
 this.arraySearch = this.options.filter((e) =>
  e.label.toLowerCase().includes(value.toLowerCase())
 );
 resultList(this.arraySearch);
}

function handleChange(value) {
 const input = value;
 var searchResult = document.getElementById("search-result-container");
 var clear = document.getElementById("clear-icn");

 if (input === "") {
  this.arraySearch = resultList(this.options);
  searchResult.style.display = "none";
  clear.style.display = "none";
 } else {
  searchData(input);
  loading();
 }
}

function resultList(data) {
 var res = data.map((items) => {
  return `<div class="result-list" style="border-color:${this.brandData.secondaryColor}" onclick="handleOptionClick('${items.cityId}', '${items.label}')">${items.label}</div>`;
 });
 $("#result-container").html(res.join(""));
}

function handleAccordionClick() {
 $(".acnav__label").click(function () {
  var label = $(this);
  var parent = label.parent(".has-children");
  var list = label.siblings(".acnav__list");
  var parentsiblings = parent.siblings();

  parentsiblings.each(function (i, e) {
   $(e).removeClass("is-open");
   $(e).children(".acnav__list").slideUp("fast");
  });

  if (parent.hasClass("is-open")) {
   list.slideUp("fast");
   parent.removeClass("is-open");
  } else {
   list.slideDown("fast");
   parent.addClass("is-open");
  }
 });
}

let resultSearch = [];
function handleOptionClick(selected, label) {
 var inputField = document.getElementById("input-field");
 var resultList = document.getElementById("result-container");
 var searchResult = document.getElementById("search-result-container");
 var clear = document.getElementById("clear-icn");
 var tempArr = [];
 const res = this.distributorData.reduce((val, currentProvince, idx, arr) => {
  // iterate over the second level array
  (currentProvince?.cities || []).forEach((city) => {
   // iterate over the third level array
   //  (city?.distributors || []).forEach((distributor) => {
   //   if (distributor.district.id === selected) {
   //    console.log(distributor.district);
   //    val.push(arr[idx]);
   //   }
   //  });

   if (city.id === selected) {
    val.push(arr[idx]);
    tempArr.push(city);
   }
  });
  // return the array reference for the next iteration
  return val;
  // set the initial value as an array for the result
 }, []);

 //then, remove duplicate item because we might input them more than once
 let uniqueArr = res.filter(
  (value, index, self) => index === self.findIndex((t) => t.id === value.id)
 );
 cardResult(uniqueArr, tempArr);
 inputField.value = label;
 searchResult.style.display = "block";
 clear.style.display = "block";
 resultList.style.display = "none";
}

//Clear Input
function clearField() {
 var resultList = document.getElementById("result-container");
 var searchResult = document.getElementById("search-result-container");
 var clear = document.getElementById("clear-icn");

 document.getElementById("input-field").value = "";
 handleChange("");
 searchResult.style.display = "none";
 clear.style.display = "none";
 resultList.style.display = "block";
}

function loading() {
 var load = document.getElementById("loading");
 var clear = document.getElementById("clear-icn");
 var resultList = document.getElementById("result-container");

 load.style.display = "block";
 clear.style.display = "none";
 resultList.style.display = "none";

 setTimeout(() => {
  load.style.display = "none";
  clear.style.display = "block";
  resultList.style.display = "block";
 }, 1500);
}

//Set Color
function setColor(value) {
 //set color berdasarkan ID
 //kalau component belum di render (e.g search result) taruh warnanya di inline style
 document.getElementById("search-btn").style.backgroundColor =
  value.primaryColor;
 document.getElementById("search-btn").style.color = value.textColor;
 document.getElementById("title-color").style.color = value.titleColor;
 document.getElementById("location").style.color = value.titleColor;
}

//Distributor card search result
function cardResult(result, tempArr) {
 var res = result.map((province) => {
  var prov = tempArr.map((city) => {
   var city = city.distributors.map((distributor) => {
    return distributorCards(province.name, city.name, distributor);
   });
   return city.join("");
  });
  return prov.join("");
 });
 return $("#search-result-container").html(res.join(""));
}

// Distributor cards
function distributorCards(provinceName, cityName, distributorData) {
 return `<div class="distributor-card" style="border-color: ${
  this.brandData.secondaryColor
 }">
    <div class="row m-0">
      <div class="col-lg-5 px-0 dist-left-container">
        <div class="details-container">
            <div class="d-flex profile-container">
                <div class="pf-container">
                    <img class="profile-pict" src=${
                      !!distributorData.imageUrl
                      ? `${BASE_STORAGE_URL}/${distributorData.imageUrl}`
                      : "https://www.mganik.com/wp-content/uploads/2022/03/placeholder_foto.png"
                    }
                        alt="profile_picture" />
                    ${starSeller(distributorData)}
                </div>
                <div class="mx-2 align-self-center name-container">
                    <p class="distributor-name">${
                      distributorData?.name || ""
                    }</p>
                </div>
            </div>

            <p class="m-0 address">${distributorData?.address || ""}</p>
            <p class="mb-1 address">
                ${distributorData?.district?.name || "[DISTRICT_NAME]"}<br>
                ${cityName || "[CITY_NAME]"}<br>
                ${provinceName || "[PROVINCE_NAME]"}
            </p>

            <div>
                <img class="mr-2" src="https://www.mganik.com/wp-content/uploads/2022/03/pinlocation_googlemaps.svg"
                    alt="pinlocation_googlemaps" />
                <a target="_blank" href=${
                  distributorData?.googleMapsUrl ||
                  "https://maps.google.com"
                }
                    class="text-primary underline-text black-font contact-shipping">
                    Peta Google
                </a>
            </div>
        </div>
      </div>

      <div class="col-lg-4 px-0">
        <div class="contact-container mt-2">
            <div class="mb-2">
                <img alt="phone-icon" class="mr-2" src="https://www.mganik.com/wp-content/uploads/2022/03/phone.svg" />
                <a class="text-primary underline-text contact-shipping black-font"
                    href=${`tel:${distributorData?.phone1 || ""}`}>
                    ${distributorData?.phone1 || ""}
                    <img class="ml-2" src="https://www.mganik.com/wp-content/uploads/2022/03/centang.svg" alt="check" />
                </a>
            </div>
            ${phone(distributorData)}
            ${isShipping(distributorData)}
            ${isCOD(distributorData)}
            <div class="icon-container mb-2">
            ${platform(distributorData.distributorBrands, "instagram")}
            ${platform(distributorData.distributorBrands, "tokopedia")}
            ${platform(distributorData.distributorBrands, "shopee")}
            ${platform(distributorData.distributorBrands, "bukalapak")}
            ${platform(distributorData.distributorBrands, "lazada")}
            </div>
        </div>
      </div>

      <div class="col-lg-3 px-0 dist-right-container" id="whatsapp-container">
        <div>
        ${isWhatsapp(distributorData)}
        </div>
      </div>
  </div>
</div>`;
}

const starSeller = (data) => {
 if (data?.distributorBrands[0]?.isStarSeller) {
  return `
    <div
      class="star-seller"
      style="background-color: ${this.brandData.primaryColor}; color: ${this.brandData.textColor};"
      >
        Star
    </div>
  `;
 } else {
  return "";
 }
};

const phone = (data) => {
 if (data?.phone2) {
  return `
    <div class="mb-2">
      <img alt="phone-icon" class="mr-2" src="https://www.mganik.com/wp-content/uploads/2022/03/phone.svg" />
      <a
        class="text-primary underline-text contact-shipping black-font"
        href=${`tel:${data?.phone2 || ""}`}
      >
        ${data?.phone2 || ""}
        <img class="ml-2" src="https://www.mganik.com/wp-content/uploads/2022/03/centang.svg" alt="check" />
      </a>
    </div>`;
 } else {
  return "";
 }
};

const isShipping = (data) => {
 if (data.isShipping) {
  return `<div class="mb-2">
    <img alt="cod-icon" class="mr-2 contact-shipping" src="https://www.mganik.com/wp-content/uploads/2022/03/pengiriman.svg" />
    <span style="font-size: 14px !important">
        ${(data?.shippings || [])
         .map((item) => {
          return item.name;
         })
         .join(", ")
         .replace(/, ([^,]*)$/, " & $1")}
    </span>
    <img class="ml-2" src="https://www.mganik.com/wp-content/uploads/2022/03/centang.svg" alt="check" />
</div>
    `;
 } else {
  return "";
 }
};

const isCOD = (data) => {
 if (data.isCOD) {
  return `
  <div class="mb-2">
    <img alt="cod-icon" class="mr-2 contact-shipping" src="https://www.mganik.com/wp-content/uploads/2022/03/cod.svg" />
    <span style="font-size: 14px !important">COD / Cash on Delivery</span>
    <img class="ml-2" src="https://www.mganik.com/wp-content/uploads/2022/03/centang.svg" alt="check" />
  </div>`;
 } else {
  return "";
 }
};

const platform = (data, name) => {
 if (data[0][name] !== "") {
  return `<div class="icons">
    <a href=${data[0][name]} target="_blank">
      <img src="https://www.mganik.com/wp-content/uploads/2022/03/${name}.png" alt="${name}-logo" class="sm-icon" />
    </a>
    </div>`;
 } else {
  return "";
 }
};

const isWhatsapp = (data) => {
 if (data.phone1WhatsappConnected) {
  return `
    <button type="button" class="btn-whatsapp p-0"
        data-action="share/whatsapp/share"
        onclick="directToWA('${data?.phone1 || ""}', '${
   data?.distributorBrands[0]?.whatsappMessages.replace(/[\n]$/, " ") || ""
  }')" 
        >
        <img alt="whatsapp-logo" src="https://www.mganik.com/wp-content/uploads/2022/03/whatsapp.png" />
        <span>BELI DISINI</span>
    </button>`;
 } else {
  return "";
 }
};

function directToWA(phone, messages) {
 const message = (messages || "").split(" ").join("%20");
 const url = `https://wa.me/${phone}?text=${message}`;
 window.open(url, "_blank");
}
