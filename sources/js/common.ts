import * as $ from 'jquery'
import * as d3 from 'd3'

export enum PublicationType {
    Article = "article",
    Book = "book",
}

export enum Language {
    Polish = "POL",
    English = "ENG"
}

export class Department {
    shortName: string;
    name: string;
    works: Array<Work>;
}

export class Work {
    title: string;
    publicationType: PublicationType;
    authors: Array<Researcher>;
    languages: Array<Language>;
    points: number;
    year: number;
    pageAmount: number;
    ministerialArticle: boolean;
}

export class Researcher {
    name: string;
    department: string;
    worksAmount: number;
}

export class Article extends Work {
    domains: Array<string>;
    discipline: string;
    journalTitle: string;
    compJournalTitle: string;

}

export class Book extends Work {
    volume: Number;
}


export async function FetchDept(shortName: string): Promise<Department> {

    const response = await fetch(`/data/department/${shortName}`);
    if (response.status !== 200) {
        return null
    }
    const body = await response.json() as Department;

    console.log(body);
    return body;
}

export function DeserializeResearchers(works: Array<any>, deptname: string):Array<Researcher> {
    const s = new Map<string, number>();
    for(const w of works) {

        for (const a of w.authors) {
            if (!s.has(a)) {
                s.set(a, 0)
            }
            s.set(a, s.get(a) + 1)
        }
    }
    return Array.from(s)
        .filter(([name, _]) => !name.includes('#'))
        .map(([name, count]) => {
        const r = new Researcher();
        r.department = deptname;
        r.name = name;
        r.worksAmount = count;
        return r
    })//.sort((a, b) => a.name > b.name ? 1 : -1)
}

export function ParseWorks() {

}



