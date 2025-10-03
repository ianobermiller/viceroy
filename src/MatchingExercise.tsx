import type React from 'react';
import { useState } from 'react';

export interface Definition {
    index: number;
    matchedTermIndex: null | number;
    text: string;
}

export interface Term {
    correctDefinitionIndex: number;
    index: number;
    text: string;
}

interface AvailableTermsProps {
    onDropToAvailable: (termIndex: number) => void;
    terms: Term[];
    usedTermIndices: number[];
}

interface DraggableItemProps {
    termIndex: number;
    text: string;
}

interface DropZoneProps {
    definitionIndex: number;
    definitionText: string;
    matchedTerm: null | Term;
    onDrop: (definitionIndex: number, termIndex: number) => void;
}

interface Props {
    definitions: Definition[];
    onUpdateInput: (definitionIndex: number, termIndex: null | number) => void;
    terms: Term[];
}

const TERM_WIDTH = 200;
const TERM_HEIGHT = 32;

export function MatchingExercise({ definitions, onUpdateInput, terms }: Props) {
    // State is just an object mapping definition index to term index
    const [definitionToTermMapping, setDefinitionToTermMapping] = useState<Record<number, null | number>>(() => {
        return definitions.reduce<Record<number, null | number>>((mapping, def) => {
            mapping[def.index] = def.matchedTermIndex;
            return mapping;
        }, {});
    });

    const handleDrop = (definitionIndex: number, termIndex: number) => {
        // Update via callback
        onUpdateInput(definitionIndex, termIndex);

        // Update state - simply set the mapping
        setDefinitionToTermMapping((prev) => {
            const newMapping = { ...prev };

            // Find if any other definition was using this term and clear it
            for (const [defIdxStr, termIdx] of Object.entries(prev)) {
                const defIdx = parseInt(defIdxStr, 10);
                if (termIdx === termIndex && defIdx !== definitionIndex) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete newMapping[defIdx];
                    onUpdateInput(defIdx, null);
                }
            }

            // Set the new mapping
            newMapping[definitionIndex] = termIndex;
            return newMapping;
        });
    };

    const handleRemoveTerm = (definitionIndex: number) => {
        if (definitionIndex in definitionToTermMapping) {
            // Update via callback
            onUpdateInput(definitionIndex, null);

            // Update state - remove the mapping
            setDefinitionToTermMapping((prev) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [definitionIndex]: removed, ...newMapping } = prev;
                return newMapping;
            });
        }
    };

    const handleDropToAvailable = (termIndex: number) => {
        // Find which definition this term was matched to and remove it
        for (const [defIdxStr, matchedTermIndex] of Object.entries(definitionToTermMapping)) {
            if (matchedTermIndex === termIndex) {
                const defIdx = parseInt(defIdxStr, 10);
                handleRemoveTerm(defIdx);
                break;
            }
        }
    };

    return (
        <div className='space-y-6'>
            {/* Available Terms */}
            <AvailableTerms
                onDropToAvailable={handleDropToAvailable}
                terms={terms}
                usedTermIndices={Object.values(definitionToTermMapping).filter((idx): idx is number => idx !== null)}
            />

            {/* Definitions with Drop Zones */}
            <section>
                <h4 className='mb-3 text-sm text-gray-700'>Definitions</h4>
                <div className='space-y-3'>
                    {definitions.map((definition) => {
                        const matchedTermIndex = definitionToTermMapping[definition.index];
                        const matchedTerm =
                            matchedTermIndex !== undefined
                                ? terms.find((t) => t.index === matchedTermIndex) || null
                                : null;

                        return (
                            <DropZone
                                definitionIndex={definition.index}
                                definitionText={definition.text}
                                key={definition.index}
                                matchedTerm={matchedTerm}
                                onDrop={handleDrop}
                            />
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

function AvailableTerms({ onDropToAvailable, terms, usedTermIndices }: AvailableTermsProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const availableTerms = terms.filter((term) => !usedTermIndices.includes(term.index));

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const termIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(termIndex) && usedTermIndices.includes(termIndex)) {
            onDropToAvailable(termIndex);
        }
    };

    return (
        <section
            className={isDragOver ? 'rounded-lg outline-2 outline-offset-4 outline-gray-400 outline-dashed' : ''}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <h4 className='mb-3 text-sm text-gray-700'>Available Terms</h4>
            <div className='flex flex-wrap gap-2'>
                {availableTerms.map((term) => (
                    <DraggableItem key={term.index} termIndex={term.index} text={term.text} />
                ))}
                {availableTerms.length === 0 && (
                    <p className='text-gray-500 italic'>
                        {isDragOver ? 'Drop here to return term' : 'All terms have been used'}
                    </p>
                )}
            </div>
        </section>
    );
}

function DraggableItem({ termIndex, text }: DraggableItemProps) {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', termIndex.toString());
        const target = e.currentTarget;
        target.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        target.style.opacity = '1';
    };

    return (
        <div
            className='cursor-grab rounded bg-gradient-to-br from-blue-100 to-purple-200 text-center text-black shadow-sm transition-all duration-200 select-none hover:scale-105 hover:shadow-md active:scale-95 active:cursor-grabbing'
            draggable
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            style={{ lineHeight: `${TERM_HEIGHT}px`, width: TERM_WIDTH }}
        >
            {text}
        </div>
    );
}

function DropZone({ definitionIndex, definitionText, matchedTerm, onDrop }: DropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const termIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(termIndex)) {
            onDrop(definitionIndex, termIndex);
        }
    };

    return (
        <div
            className={`flex items-center gap-4 rounded-lg p-4 transition-all duration-200 ${
                isDragOver ? 'bg-gray-100' : ''
            }`}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Term on the left with fixed width */}
            <div className='flex-shrink-0' style={{ width: TERM_WIDTH }}>
                {matchedTerm ? (
                    <DraggableItem termIndex={matchedTerm.index} text={matchedTerm.text} />
                ) : (
                    <div
                        className='rounded border-2 border-dashed border-gray-300 text-gray-400'
                        style={{ height: TERM_HEIGHT, width: TERM_WIDTH }}
                    />
                )}
            </div>

            {/* Definition text on the right */}
            <span className='flex-1 text-gray-700'>{definitionText}</span>
        </div>
    );
}
