import { useState } from "react";

export interface WordMeaning {
    word_class: string;
    description: string;
    descriptors: ReadonlyArray<string>;
}

export interface WordData {
    word: string;
    count: number;
    meanings: ReadonlyArray<WordMeaning>
}

export function WordInfo({data, initClosed}: 
    {data: WordData, initClosed: boolean}) {
    const [closed, setClosed] = useState(initClosed);

    return (
        <div className="word-panel" onClick={() => setClosed(!closed)}>
            {closed ? 
                <div className="word-name">{data.word}</div>
            :
                <div>
                    <div className="word-name">{data.word}</div>
                    {data.meanings.map(meaning => <div className="word-meaning">
                        <div className="word-class">{meaning.word_class}</div>
                        <div className="word-descriptors">{meaning.descriptors.join(", ")}</div>
                        <div className="word-description">{meaning.description}</div>
                    </div>)}
                </div>
            }
        </div>
    )
}