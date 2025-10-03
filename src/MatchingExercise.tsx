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

interface DraggableItemProps {
    termIndex: number;
    text: string;
}

interface DropZoneProps {
    definitionIndex: number;
    definitionText: string;
    matchedTerm: null | Term;
    onDrop: (definitionIndex: number, termIndex: number) => void;
    onRemoveTerm: (definitionIndex: number) => void;
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

    return (
        <div className='space-y-6'>
            {/* Available Terms */}
            <section>
                <h4 className='mb-3 font-medium text-gray-700'>Available Terms</h4>
                <div className='flex flex-wrap gap-2'>
                    {terms
                        .filter((term) => !Object.values(definitionToTermMapping).includes(term.index))
                        .map((term) => (
                            <DraggableItem key={term.index} termIndex={term.index} text={term.text} />
                        ))}
                    {terms.filter((term) => !Object.values(definitionToTermMapping).includes(term.index)).length ===
                        0 && <p className='text-gray-500 italic'>All terms have been used</p>}
                </div>
            </section>

            {/* Definitions with Drop Zones */}
            <section>
                <h4 className='mb-3 font-medium text-gray-700'>Definitions</h4>
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
                                onRemoveTerm={handleRemoveTerm}
                            />
                        );
                    })}
                </div>
            </section>
        </div>
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
            className='cursor-grab rounded bg-gradient-to-br from-indigo-500 to-purple-600 text-center text-white shadow-sm transition-all duration-200 select-none hover:scale-105 hover:shadow-md active:scale-95 active:cursor-grabbing'
            draggable
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            style={{ lineHeight: TERM_HEIGHT, width: TERM_WIDTH }}
        >
            {text}
        </div>
    );
}

function DropZone({ definitionIndex, definitionText, matchedTerm, onDrop, onRemoveTerm }: DropZoneProps) {
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

    const handleRemoveClick = () => {
        onRemoveTerm(definitionIndex);
    };

    return (
        <div
            className={`flex items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${
                isDragOver
                    ? 'border-sky-500 bg-sky-100'
                    : matchedTerm
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-sky-300 hover:bg-sky-50'
            }`}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Term on the left with fixed width */}
            <div className='flex-shrink-0' style={{ width: TERM_WIDTH }}>
                {matchedTerm ? (
                    <div className='flex items-center gap-2'>
                        <DraggableItem termIndex={matchedTerm.index} text={matchedTerm.text} />
                        <button
                            className='text-gray-400 transition-colors hover:text-red-500'
                            onClick={handleRemoveClick}
                            title='Remove match'
                        >
                            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                    d='M6 18L18 6M6 6l12 12'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                />
                            </svg>
                        </button>
                    </div>
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
