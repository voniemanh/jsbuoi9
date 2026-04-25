// ==================== DOM VARIABLES ====================
const btnAdd = document.getElementById("btnAdd");
const btnAddEmployee = document.getElementById("btnAddEmployee");
const btnUpdate = document.getElementById("btnUpdate");
const btnClose = document.getElementById("btnClose");
const btnSearchEmployee = document.getElementById("btnSearchEmployee");
const searchName = document.getElementById("searchName");
const sortAsc = document.getElementById("sortAsc");
const sortDesc = document.getElementById("sortDesc");
const tableEmployeeList = document.getElementById("tableEmployeeList");
const headerTitle = document.getElementById("headerTitle");

// Form inputs
const inputUsername = document.getElementById("username");
const inputFullName = document.getElementById("fullName");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputDatepicker = document.getElementById("datepicker");
const inputBaseSalary = document.getElementById("baseSalary");
const selectPosition = document.getElementById("position");
const inputWorkHours = document.getElementById("workHours");

// Notify spans
const notifyUsername = document.getElementById("notifyUsername");
const notifyFullName = document.getElementById("notifyFullName");
const notifyEmail = document.getElementById("notifyEmail");
const notifyPassword = document.getElementById("notifyPassword");
const notifyDate = document.getElementById("notifyDate");
const notifyBaseSalary = document.getElementById("notifyBaseSalary");
const notifyPosition = document.getElementById("notifyPosition");
const notifyWorkHours = document.getElementById("notifyWorkHours");

// ==================== CONSTANTS ====================
const API_URL = "http://localhost:3000/staffs";

const POSITION = {
  DIRECTOR: "Giám đốc",
  MANAGER: "Trưởng Phòng",
  EMPLOYEE: "Nhân Viên",
};

// Hệ số lương theo chức vụ
const SALARY_COEFFICIENT = {
  [POSITION.DIRECTOR]: 3.0,
  [POSITION.MANAGER]: 2.0,
  [POSITION.EMPLOYEE]: 1.0,
};

// Phân loại nhân viên theo giờ làm
function getStaffType(workHours) {
  if (workHours >= 192) return "Xuất sắc";
  if (workHours >= 176) return "Giỏi";
  if (workHours >= 160) return "Khá";
  if (workHours >= 128) return "Trung bình";
  return "Yếu";
}

// ==================== CLASS STAFF ====================
class Staff {
  constructor(
    username,
    fullName,
    email,
    password,
    startDate,
    baseSalary,
    position,
    workHours,
  ) {
    this.username = username;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.startDate = startDate;
    this.baseSalary = Number(baseSalary);
    this.position = position;
    this.workHours = Number(workHours);
    this.totalSalary = this.calcTotalSalary();
    this.staffType = getStaffType(this.workHours);
  }

  calcTotalSalary() {
    const coefficient = SALARY_COEFFICIENT[this.position] || 1;
    return this.baseSalary * coefficient * this.workHours;
  }
}

// ==================== API FUNCTIONS ====================
async function fetchAllStaffs() {
  const res = await fetch(API_URL);
  return await res.json();
}

async function addStaffToServer(staff) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staff),
  });
  return await res.json();
}

async function updateStaffOnServer(id, staff) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staff),
  });
  return await res.json();
}

async function deleteStaffFromServer(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}

// ==================== RENDER ====================
function formatCurrency(amount) {
  return Number(amount).toLocaleString("vi-VN") + " ₫";
}

function renderTable(staffList) {
  tableEmployeeList.innerHTML = "";

  if (staffList.length === 0) {
    tableEmployeeList.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted">Không có nhân viên nào.</td>
      </tr>`;
    return;
  }

  staffList.forEach((staff) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${staff.username}</td>
      <td>${staff.fullName}</td>
      <td>${staff.email}</td>
      <td>${staff.startDate}</td>
      <td>${staff.position}</td>
      <td>${formatCurrency(staff.totalSalary)}</td>
      <td>${staff.staffType}</td>
      <td>
        <button class="btn btn-warning btn-sm btn-edit" data-id="${staff.id}">
          <i class="fa fa-pencil"></i>
        </button>
        <button class="btn btn-danger btn-sm btn-delete" data-id="${staff.id}">
          <i class="fa fa-trash"></i>
        </button>
      </td>`;
    tableEmployeeList.appendChild(tr);
  });
}

async function loadAndRender() {
  const staffs = await fetchAllStaffs();
  renderTable(staffs);
}

// ==================== VALIDATION ====================
function clearNotifications() {
  [
    notifyUsername,
    notifyFullName,
    notifyEmail,
    notifyPassword,
    notifyDate,
    notifyBaseSalary,
    notifyPosition,
    notifyWorkHours,
  ].forEach((el) => (el.textContent = ""));
}

function validateForm() {
  let isValid = true;
  clearNotifications();

  // Tài khoản: không để trống, chỉ chứa số, 4-6 ký tự
  const username = inputUsername.value.trim();
  if (!username) {
    notifyUsername.textContent = "Vui lòng nhập tài khoản.";
    isValid = false;
  } else if (!/^\d{4,6}$/.test(username)) {
    notifyUsername.textContent =
      "Tài khoản phải là 4-6 ký số (chỉ chứa chữ số).";
    isValid = false;
  }

  // Họ và tên: không để trống, chỉ chứa chữ cái và khoảng trắng
  const fullName = inputFullName.value.trim();
  if (!fullName) {
    notifyFullName.textContent = "Vui lòng nhập họ và tên.";
    isValid = false;
  } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName)) {
    notifyFullName.textContent = "Họ và tên chỉ được chứa chữ cái.";
    isValid = false;
  }

  // Email: không để trống, đúng định dạng
  const email = inputEmail.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    notifyEmail.textContent = "Vui lòng nhập email.";
    isValid = false;
  } else if (!emailRegex.test(email)) {
    notifyEmail.textContent = "Email không đúng định dạng.";
    isValid = false;
  }

  // Mật khẩu: không để trống, 6-10 ký tự, có ít nhất 1 số, 1 hoa, 1 ký tự đặc biệt
  const password = inputPassword.value;
  if (!password) {
    notifyPassword.textContent = "Vui lòng nhập mật khẩu.";
    isValid = false;
  } else if (password.length < 6 || password.length > 10) {
    notifyPassword.textContent = "Mật khẩu phải từ 6-10 ký tự.";
    isValid = false;
  } else if (!/[0-9]/.test(password)) {
    notifyPassword.textContent = "Mật khẩu phải chứa ít nhất 1 ký tự số.";
    isValid = false;
  } else if (!/[A-Z]/.test(password)) {
    notifyPassword.textContent = "Mật khẩu phải chứa ít nhất 1 ký tự in hoa.";
    isValid = false;
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    notifyPassword.textContent = "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.";
    isValid = false;
  }

  // Ngày làm: không để trống, định dạng mm/dd/yyyy
  const dateVal = inputDatepicker.value.trim();
  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
  if (!dateVal) {
    notifyDate.textContent = "Vui lòng nhập ngày làm.";
    isValid = false;
  } else if (!dateRegex.test(dateVal)) {
    notifyDate.textContent = "Ngày làm phải đúng định dạng mm/dd/yyyy.";
    isValid = false;
  }

  // Lương cơ bản: không để trống, trong khoảng 1,000,000 - 20,000,000
  const baseSalary = Number(inputBaseSalary.value);
  if (!inputBaseSalary.value) {
    notifyBaseSalary.textContent = "Vui lòng nhập lương cơ bản.";
    isValid = false;
  } else if (
    isNaN(baseSalary) ||
    baseSalary < 1000000 ||
    baseSalary > 20000000
  ) {
    notifyBaseSalary.textContent =
      "Lương cơ bản phải từ 1.000.000 đến 20.000.000 ₫.";
    isValid = false;
  }

  // Chức vụ: phải chọn hợp lệ
  if (!Object.values(POSITION).includes(selectPosition.value)) {
    notifyPosition.textContent = "Vui lòng chọn chức vụ hợp lệ.";
    isValid = false;
  }

  // Giờ làm: phải là số dương
  if (
    !inputWorkHours.value ||
    isNaN(inputWorkHours.value) ||
    Number(inputWorkHours.value) <= 0
  ) {
    notifyWorkHours.textContent = "Giờ làm phải là số dương.";
    isValid = false;
  }

  return isValid;
}

// ==================== FORM HELPERS ====================
function getFormValues() {
  return new Staff(
    inputUsername.value.trim(),
    inputFullName.value.trim(),
    inputEmail.value.trim(),
    inputPassword.value,
    inputDatepicker.value.trim(),
    inputBaseSalary.value,
    selectPosition.value,
    inputWorkHours.value,
  );
}

function resetForm() {
  inputUsername.value = "";
  inputFullName.value = "";
  inputEmail.value = "";
  inputPassword.value = "";
  inputDatepicker.value = "";
  inputBaseSalary.value = "";
  selectPosition.value = "Chọn chức vụ";
  inputWorkHours.value = "";
  clearNotifications();
}

function setModalMode(mode) {
  if (mode === "add") {
    headerTitle.textContent = "Thêm nhân viên";
    btnAddEmployee.style.display = "inline-block";
    btnUpdate.style.display = "none";
  } else {
    headerTitle.textContent = "Cập nhật nhân viên";
    btnAddEmployee.style.display = "none";
    btnUpdate.style.display = "inline-block";
  }
}

function fillForm(staff) {
  inputUsername.value = staff.username;
  inputFullName.value = staff.fullName;
  inputEmail.value = staff.email;
  inputPassword.value = staff.password;
  inputDatepicker.value = staff.startDate;
  inputBaseSalary.value = staff.baseSalary;
  selectPosition.value = staff.position;
  inputWorkHours.value = staff.workHours;
}

// ==================== EVENT LISTENERS ====================

btnAdd.addEventListener("click", () => {
  resetForm();
  setModalMode("add");
  $("#myModal").modal("show"); // mở modal sau khi đã set mode
});

// Thêm nhân viên
btnAddEmployee.addEventListener("click", async () => {
  if (!validateForm()) return;

  const newStaff = getFormValues();
  await addStaffToServer(newStaff);
  await loadAndRender();

  $("#myModal").modal("hide");
  resetForm();
});

// Cập nhật nhân viên
let currentEditId = null;

btnUpdate.addEventListener("click", async () => {
  if (!validateForm()) return;

  const updatedStaff = getFormValues();
  await updateStaffOnServer(currentEditId, updatedStaff);
  await loadAndRender();

  $("#myModal").modal("hide");
  resetForm();
  currentEditId = null;
});

// Xoá và sửa (event delegation)
tableEmployeeList.addEventListener("click", async (e) => {
  // Xoá
  const deleteBtn = e.target.closest(".btn-delete");
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm("Bạn có chắc muốn xoá nhân viên này?")) {
      await deleteStaffFromServer(id);
      await loadAndRender();
    }
    return;
  }

  // Sửa
  const editBtn = e.target.closest(".btn-edit");
  if (editBtn) {
    const id = editBtn.dataset.id;
    const staffs = await fetchAllStaffs();
    const staff = staffs.find((s) => String(s.id) === String(id));
    if (!staff) return;

    currentEditId = id;
    fillForm(staff);
    setModalMode("edit");
    $("#myModal").modal("show");
  }
});

// Tìm kiếm
btnSearchEmployee.addEventListener("click", async () => {
  const keyword = searchName.value.trim().toLowerCase();
  const staffs = await fetchAllStaffs();
  const filtered = staffs.filter(
    (s) =>
      s.position.toLowerCase().includes(keyword) ||
      s.fullName.toLowerCase().includes(keyword),
  );
  renderTable(filtered);
});

// Sắp xếp tăng dần theo tài khoản
sortAsc.addEventListener("click", async () => {
  const staffs = await fetchAllStaffs();
  staffs.sort((a, b) => a.username.localeCompare(b.username));
  renderTable(staffs);
});

// Sắp xếp giảm dần theo tài khoản
sortDesc.addEventListener("click", async () => {
  const staffs = await fetchAllStaffs();
  staffs.sort((a, b) => b.username.localeCompare(a.username));
  renderTable(staffs);
});

// Đóng modal reset form
btnClose.addEventListener("click", () => {
  resetForm();
  currentEditId = null;
});

// ==================== INIT ====================
loadAndRender();
