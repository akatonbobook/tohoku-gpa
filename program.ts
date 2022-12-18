type CalcGPA = (rawStr: string) => void;
type Zenkaku2hankaku = (str: string) => string;

const Grade = {
  E: "E",
  D: "D",
  C: "C",
  B: "B",
  A: "A",
  AA: "AA"
} as const;
type Grade = typeof Grade[keyof typeof Grade];

const GradePoint: Map<Grade, number> = new Map([
  ['E', 0],
  ['D', 0],
  ['C', 1],
  ['B', 2],
  ['A', 3],
  ['AA', 4]
]);


abstract class AbstractCategory {
  private _name: string;
  private _results: Result[];
  constructor(name: string) {
    this._name = name;
    this._results = [];
  }
  get name() {
    return this._name;
  }
  get results() {
    return this._results;
  }
  getPassedResults(): Result[] {
    return this._results.filter(r => {
      let gpa: number | undefined;
      return (gpa = GradePoint.get(r.grade)) && gpa > 0;
    });
  }
  getGradeResults(grade: Grade): Result[] {
    return this._results.filter(r => r.grade == grade);
  }
  countPassedCredits(): number {
    return this.getPassedResults().reduce((nowValue, result) => nowValue + result.credit, 0);
  }
  conutRegisteredCredits(): number {
    return this.results.filter(r => r.grade != Grade.E).reduce((nowValue, result) => nowValue + result.credit, 0);
  }
  calcTotalGradePoint(): number {
    return this.results.reduce((sum, result) => {
      let gradePoint: number | undefined;
      if (gradePoint = GradePoint.get(result.grade)) {
        return sum + gradePoint * result.credit;
      }
      return sum;
    }, 0);
  }
  countGrade(grade: Grade): number {
    return this.getGradeResults(grade).reduce((c, r) => c + r.credit, 0);
  }
  abstract getTableRow(): HTMLElement[];
}

class Category extends AbstractCategory {
  private _subcategories: Array<SubCategory>;
  
  constructor(name: string) {
    super(name);
    this._subcategories = [];
  }

  get subcategories() {
    return this._subcategories;
  }

  getTableRow(): HTMLElement[] {
      const rows = new Array<HTMLElement>();
      rows.push(document.createElement('tr'));
      rows[0].appendChild(document.createElement('td'));
      rows[0].children[0].appendChild(document.createTextNode(this.name));
      rows[0].children[0].classList.add('none-right-border', 'category', 'vartical-writing');
      rows[0].children[0].setAttribute('rowspan', String(this.subcategories.length + 2));
      for (const sc of this.subcategories) {
        rows.push(...sc.getTableRow());
      }
      rows.push(document.createElement('tr'));
      for (let i=0; i<9; i++) {
        rows[rows.length-1].appendChild(document.createElement('td'));
        rows[rows.length-1].children[i].classList.add('category', 'categorytable');
      }
      rows[rows.length-1].children[0].classList.add('none-left-border');
      rows[rows.length-1].children[1].appendChild(document.createTextNode(String(this.countGrade('AA'))));
      rows[rows.length-1].children[2].appendChild(document.createTextNode(String(this.countGrade('A'))));
      rows[rows.length-1].children[3].appendChild(document.createTextNode(String(this.countGrade('B'))));
      rows[rows.length-1].children[4].appendChild(document.createTextNode(String(this.countGrade('C'))));
      rows[rows.length-1].children[5].appendChild(document.createTextNode(String(this.countGrade('D'))));
      rows[rows.length-1].children[6].appendChild(document.createTextNode(String(this.countGrade('E'))));
      rows[rows.length-1].children[7].appendChild(document.createTextNode(String(this.countPassedCredits())));
      rows[rows.length-1].children[8].appendChild(document.createTextNode(String(Math.round(100*this.calcTotalGradePoint()/this.conutRegisteredCredits())/100)));
      for (const td of rows[rows.length-1].children) {
        if (td.textContent?.match(/\d+/)) {
          if (td.textContent == '0') {
            td.classList.add('zero');
          } else {
            td.classList.add('bold');
          }
          console.log(td);
        }
      }
      return rows;
  }
}


class SubCategory extends AbstractCategory {
  private _category: Category;

  constructor(name: string, category: Category) {
    super(name);
    this._category = category;
  }
  get category() {
    return this._category;
  }

  getTableRow(): HTMLElement[] {
      const rows = new Array<HTMLElement>();
      rows.push(document.createElement('tr'));
      for (let i=0; i<9; i++) {
        rows[0].appendChild(document.createElement('td')); 
        rows[0].children[i].classList.add('categorytable');
      }
      rows[0].children[0].appendChild(document.createTextNode(this.name));
      rows[0].children[1].appendChild(document.createTextNode(String(this.countGrade("AA"))));
      rows[0].children[2].appendChild(document.createTextNode(String(this.countGrade("A"))));
      rows[0].children[3].appendChild(document.createTextNode(String(this.countGrade("B"))));
      rows[0].children[4].appendChild(document.createTextNode(String(this.countGrade("C"))));
      rows[0].children[5].appendChild(document.createTextNode(String(this.countGrade("D"))));
      rows[0].children[6].appendChild(document.createTextNode(String(this.countGrade("E"))));
      rows[0].children[7].appendChild(document.createTextNode(String(this.countPassedCredits())));
      rows[0].children[8].appendChild(document.createTextNode(String(Math.round(100*this.calcTotalGradePoint()/this.conutRegisteredCredits())/100)));
      for (const td of rows[0].children) {
        if (td.textContent?.match(/\d+/)) {
          if (td.textContent == '0') {
            td.classList.add('zero');
          } else {
            td.classList.add('bold');
          }
        }
      }
      return rows;
  }
}


class Result {
  private _name: string;
  private _teacher: string;
  private _credit: number;
  private _grade: Grade;
  private _term: number;
  private _semester: string;
  constructor(name: string, teacher: string, credit: number, grade: Grade, term: number, semester: string) {
    this._name = name;
    this._teacher = teacher;
    this._credit = credit;
    this._grade = grade;
    this._term = term;
    this._semester = semester;
  }
  get grade() {
    return this._grade;
  }
  get name() {
    return this._name;
  }
  get teacher() {
    return this._teacher;
  }
  get credit() {
    return this._credit;
  }
  get semester() {
    return this._semester;
  }
  get term() {
    return this._term;
  }
}


let categories = new Array<Category>();
const _space = "[\\t ]*";
  let regStr = " {13}";
      regStr += `(?<name>[^\\t]+)` + _space;
      regStr += `(?<teacher>[^\\t]+?)` + _space;
      regStr += `選択` + _space;
      regStr += `(?<credits>\\b\\d+(.\\d+)?\\b)` + _space;
      regStr += `(?<grade>(${Array.from(GradePoint.keys()).join('|')}))` + _space;
      regStr += `(?<term>\\b\\d{4}\\b)` + _space;
      regStr += `(?<semester>.+)`;
const resultReg = new RegExp(regStr);
const categoryReg = new RegExp("^(?<category>\\S+)$");
const subCategoryReg = new RegExp("^ {5}(?<subCategory>\\S+)$");

const calcGPA: CalcGPA = function (rawStr) {
  rawStr = zenkaku2hankaku(rawStr);
  const lines = rawStr.split('\n');
  categories = [];
  let currentCategory: Category | undefined | null = null;
  let currentSubCategory: SubCategory | undefined | null = null;
  
  for (const line of lines) {
    const result = line.match(resultReg);
    const category = line.match(categoryReg);
    const subCategory = line.match(subCategoryReg);
    if (category) {
      const categoryName = category.groups?.category;
      if (!categoryName) continue;
      categories.find(c => c.name == categoryName) || categories.push(new Category(categoryName));
      currentCategory = categories.find(c => c.name == categoryName);
    } else if (subCategory) {
      const subCategoryName = subCategory.groups?.subCategory;
      if (!subCategoryName) continue;
      currentCategory?.subcategories.find(s => s.name == subCategoryName) || currentCategory?.subcategories.push(new SubCategory(subCategoryName, currentCategory));
      currentSubCategory = currentCategory?.subcategories.find(s => s.name == subCategoryName);
    } else if (result) {
      const [name, grade, credits, teacher, term, semester] 
          = [result.groups?.name, <Grade>result.groups?.grade, Number(result.groups?.credits), result.groups?.teacher, Number(result.groups?.term), result.groups?.semester];
      if (!name || !grade || !credits || !teacher || !term || !semester || !currentCategory || !currentSubCategory) continue;
      const r = new Result(name, teacher, credits, grade, term, semester);
      currentCategory?.results.push(r);
      currentSubCategory?.results.push(r);
    }
  }
  
  let totalGradePoints = categories.reduce((sum, category) => sum + category.calcTotalGradePoint(), 0);
  let registered = categories.reduce((sum, category) => sum + category.conutRegisteredCredits(), 0);
  let passed = categories.reduce((sum, category) => sum + category.countPassedCredits(), 0);
  
  const GPA_ELEMENT = document.getElementById('gpa');
  if (GPA_ELEMENT) GPA_ELEMENT.innerHTML = String((registered == 0) ? 0 : Math.round(100*totalGradePoints / registered)/100);
  const REG_ELEMENT = document.getElementById('registered');
  if (REG_ELEMENT) REG_ELEMENT.innerHTML = String(registered);
  const PAS_ELEMENT = document.getElementById('passed');
  if (PAS_ELEMENT) PAS_ELEMENT.innerHTML = String(passed);
  let DETAILS: HTMLElement | null;
  if (!(DETAILS = document.getElementById('details'))) return;
  DETAILS.innerHTML = "";
  if (registered != 0) {
    const table = document.createElement('table');
    table.classList.add('categorytable');
    const rows = new Array<HTMLElement>();
    rows.push(document.createElement('tr'));
    rows[0].classList.add('categorytable');
    
    const headers = ['類', '群', 'AA', 'A', 'B', 'C', 'D', 'E', '取得単位数', 'GPA'];
    for (let i=0; i<10; i++) {
      rows[0].appendChild(document.createElement('th'));
      rows[0].children[i].classList.add('categorytable');
      rows[0].children[i].appendChild(document.createTextNode(headers[i]));
    }

    for (const c of categories) {
      rows.push(...c.getTableRow());
    }

    for (const r of rows) {
      table.appendChild(r);
    }
    DETAILS.appendChild(table)
  }
};

const zenkaku2hankaku: Zenkaku2hankaku = function (str) {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0)-0xFEE0));
};

window.onload = function () {
  document.getElementById('calcButton')?.addEventListener('click', e => {
    calcGPA((<HTMLInputElement>document.getElementById('rawtext')).value);
  });
};
