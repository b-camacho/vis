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

export function DeserializeResearchers(works: Array<any>):Array<Researcher> {
    const s = new Set<string>();
    for(const w of works) {
        for (const a of w.authors) {
            s.add(a)
        }
    }
    return Array.from(s).map(name => {
        const r = new Researcher();
        r.name = name;
        return r
    })
}

export function ParseWorks() {

}



