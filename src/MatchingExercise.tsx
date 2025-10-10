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

interface AvailableItemsProps {
    items: Definition[] | Term[];
    label: string;
    onDropToAvailable: (itemIndex: number) => void;
    onSelectItem: (itemIndex: number) => void;
    selectedItemIndex: null | number;
    usedItemIndices: number[];
}

interface DraggableItemProps {
    isSelected: boolean;
    onClick: (e?: React.MouseEvent<HTMLDivElement>) => void;
    termIndex: number;
    text: string;
}

interface DropZoneProps {
    fixedText: string;
    isClickable: boolean;
    matchedItem: { index: number; text: string } | null;
    onClick: () => void;
    onDrop: (droppedItemIndex: number) => void;
    onRemoveItem: () => void;
    selectedItemIndex: null | number;
}

interface Props {
    definitions: Definition[];
    onUpdateInput: (definitionIndex: number, termIndex: null | number) => void;
    terms: Term[];
}

const TERM_WIDTH = 200;
const TERM_HEIGHT = 28;

export function MatchingExercise({ definitions, onUpdateInput, terms }: Props) {
    // State is just an object mapping definition index to term index
    const [definitionToTermMapping, setDefinitionToTermMapping] = useState<Record<number, null | number>>(() => {
        return definitions.reduce<Record<number, null | number>>((mapping, def) => {
            mapping[def.index] = def.matchedTermIndex;
            return mapping;
        }, {});
    });

    // State to track whether terms and definitions are swapped in the display
    const [swapped, setSwapped] = useState(false);

    // State to track the currently selected item for click-to-match interaction
    const [selectedItemIndex, setSelectedItemIndex] = useState<null | number>(null);

    const handleSelectItem = (itemIndex: number) => {
        // Toggle selection: if the item is already selected, deselect it
        setSelectedItemIndex((prev) => (prev === itemIndex ? null : itemIndex));
    };

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

        // Clear selection after successful match
        setSelectedItemIndex(null);
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

    // Get used definition indices (definitions that have been matched to terms)
    const usedDefinitionIndices = Object.keys(definitionToTermMapping)
        .map((k) => parseInt(k, 10))
        .filter((defIdx) => definitionToTermMapping[defIdx] !== null);

    return (
        <div className='space-y-6'>
            {/* Swap Button */}
            <div className='flex justify-end'>
                <button
                    className='rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-300'
                    onClick={() => setSwapped(!swapped)}
                    type='button'
                >
                    ⇄ Swap Terms ↔ Definitions
                </button>
            </div>

            {swapped ? (
                // Swapped mode: definitions are draggable, terms are fixed
                <>
                    {/* Available Definitions */}
                    <AvailableItems
                        items={definitions}
                        label='Available Definitions'
                        onDropToAvailable={(definitionIndex) => {
                            // Find which term this definition was matched to and clear it
                            if (definitionToTermMapping[definitionIndex] !== undefined) {
                                handleRemoveTerm(definitionIndex);
                            }
                        }}
                        onSelectItem={handleSelectItem}
                        selectedItemIndex={selectedItemIndex}
                        usedItemIndices={usedDefinitionIndices}
                    />

                    {/* Terms with Drop Zones for Definitions */}
                    <section>
                        <h4 className='mb-3 text-sm text-gray-700'>Terms</h4>
                        {terms.map((term) => {
                            // Find which definition is matched to this term
                            const matchedDefinitionIndex = Object.entries(definitionToTermMapping).find(
                                ([, termIdx]) => termIdx === term.index,
                            )?.[0];
                            const matchedDefinition = matchedDefinitionIndex
                                ? definitions.find((d) => d.index === parseInt(matchedDefinitionIndex, 10)) || null
                                : null;

                            return (
                                <DropZone
                                    fixedText={term.text}
                                    isClickable={selectedItemIndex !== null}
                                    key={term.index}
                                    matchedItem={matchedDefinition}
                                    onClick={() => {
                                        if (selectedItemIndex !== null) {
                                            handleDrop(selectedItemIndex, term.index);
                                        }
                                    }}
                                    onDrop={(definitionIndex) => {
                                        // When dropping a definition onto a term, map that term to that definition
                                        handleDrop(definitionIndex, term.index);
                                    }}
                                    onRemoveItem={() => {
                                        if (matchedDefinitionIndex) {
                                            handleRemoveTerm(parseInt(matchedDefinitionIndex, 10));
                                        }
                                    }}
                                    selectedItemIndex={selectedItemIndex}
                                />
                            );
                        })}
                    </section>
                </>
            ) : (
                // Normal mode: terms are draggable, definitions are fixed
                <>
                    {/* Available Terms */}
                    <AvailableItems
                        items={terms}
                        label='Available Terms'
                        onDropToAvailable={handleDropToAvailable}
                        onSelectItem={handleSelectItem}
                        selectedItemIndex={selectedItemIndex}
                        usedItemIndices={Object.values(definitionToTermMapping).filter(
                            (idx): idx is number => idx !== null,
                        )}
                    />

                    {/* Definitions with Drop Zones for Terms */}
                    <section>
                        <h4 className='mb-3 text-sm text-gray-700'>Definitions</h4>
                        {definitions.map((definition) => {
                            const matchedTermIndex = definitionToTermMapping[definition.index];
                            const matchedTerm =
                                matchedTermIndex !== undefined
                                    ? terms.find((t) => t.index === matchedTermIndex) || null
                                    : null;

                            return (
                                <DropZone
                                    fixedText={definition.text}
                                    isClickable={selectedItemIndex !== null}
                                    key={definition.index}
                                    matchedItem={matchedTerm}
                                    onClick={() => {
                                        if (selectedItemIndex !== null) {
                                            handleDrop(definition.index, selectedItemIndex);
                                        }
                                    }}
                                    onDrop={(termIndex) => handleDrop(definition.index, termIndex)}
                                    onRemoveItem={() => handleRemoveTerm(definition.index)}
                                    selectedItemIndex={selectedItemIndex}
                                />
                            );
                        })}
                    </section>
                </>
            )}
        </div>
    );
}

function AvailableItems({
    items,
    label,
    onDropToAvailable,
    onSelectItem,
    selectedItemIndex,
    usedItemIndices,
}: AvailableItemsProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const availableItems = items
        .filter((item) => !usedItemIndices.includes(item.index))
        .sort((a, b) => a.text.localeCompare(b.text));

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

        const itemIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(itemIndex) && usedItemIndices.includes(itemIndex)) {
            onDropToAvailable(itemIndex);
        }
    };

    return (
        <section
            className={isDragOver ? 'rounded-lg outline-2 outline-offset-4 outline-gray-400 outline-dashed' : ''}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <h4 className='mb-3 text-sm text-gray-700'>{label}</h4>
            <div className='flex flex-wrap gap-2'>
                {availableItems.map((item) => (
                    <DraggableItem
                        isSelected={selectedItemIndex === item.index}
                        key={item.index}
                        onClick={() => onSelectItem(item.index)}
                        termIndex={item.index}
                        text={item.text}
                    />
                ))}
                {availableItems.length === 0 && (
                    <p className='text-gray-500 italic'>
                        {isDragOver ? 'Drop here to return' : 'All items have been used'}
                    </p>
                )}
            </div>
        </section>
    );
}

function DraggableItem({ isSelected, onClick, termIndex, text }: DraggableItemProps) {
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
            className={`cursor-pointer rounded px-1 text-center text-black shadow-sm transition-all duration-200 select-none hover:scale-105 hover:shadow-md active:scale-95 ${
                isSelected
                    ? 'bg-gradient-to-br from-yellow-200 to-yellow-300 ring-2 ring-yellow-400'
                    : 'bg-gradient-to-br from-blue-100 to-purple-200'
            }`}
            draggable
            onClick={onClick}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            style={{ lineHeight: `${TERM_HEIGHT}px`, width: TERM_WIDTH }}
        >
            {text}
        </div>
    );
}

function DropZone({
    fixedText,
    isClickable,
    matchedItem,
    onClick,
    onDrop,
    onRemoveItem,
    selectedItemIndex,
}: DropZoneProps) {
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

        const droppedItemIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(droppedItemIndex)) {
            onDrop(droppedItemIndex);
        }
    };

    const handleClick = () => {
        if (isClickable) {
            onClick();
        }
    };

    return (
        <div
            className={`flex items-center gap-4 rounded-lg py-0.5 transition-all duration-200 ${
                isDragOver ? 'bg-gray-100' : ''
            } ${isClickable ? 'cursor-pointer hover:bg-blue-50' : ''}`}
            onClick={handleClick}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Draggable item on the left with fixed width */}
            <div className='flex-shrink-0' style={{ width: TERM_WIDTH }}>
                {matchedItem ? (
                    <DraggableItem
                        isSelected={selectedItemIndex === matchedItem.index}
                        onClick={(e) => {
                            e?.stopPropagation();
                            onRemoveItem();
                        }}
                        termIndex={matchedItem.index}
                        text={matchedItem.text}
                    />
                ) : (
                    <div
                        className={`rounded border-2 border-dashed text-gray-400 ${
                            isClickable ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                        }`}
                        style={{ height: TERM_HEIGHT, width: TERM_WIDTH }}
                    />
                )}
            </div>

            {/* Fixed text on the right */}
            <span className='flex-1 text-gray-700'>{fixedText}</span>
        </div>
    );
}
