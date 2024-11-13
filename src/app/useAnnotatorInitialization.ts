import {useEffect, useRef, useState} from 'react';
import {useAnnotator} from '@annotorious/react';
import {useDispatch, useSelector} from "react-redux";
import {
    addAnnotation, removeAnnotationById,
    setAnnotations,
    setNucleiSegmentation,
    toggleEditPanel,
    updateAnnotationById
} from "@/store/slices/annotationSlide";
import {RootState} from "@/store";

const useAnnotatorInitialization = () =>{
    const dispatch = useDispatch();
    const annotatorInstance = useAnnotator<any>();
    const viewerRef = useRef<any>(null);
    const annotatorRef = useRef<any>(null);

    const annotations = useSelector((state: RootState) => state.annotations.annotations)
    const editAnnotation = useSelector((state: RootState) => state.annotations.editAnnotation)

    useEffect(() => {
        if (annotatorInstance) {
                annotatorRef.current = annotatorInstance;
                viewerRef.current = annotatorInstance.viewer;

                annotatorInstance.on('createAnnotation', (annotation: any) => {
                    console.log('Annotation created:', annotation);
                    dispatch(addAnnotation(annotation));
                });

                annotatorInstance.on('deleteAnnotation', (annotation: any) => {
                    console.log('Annotation deleted:', annotation);
                    dispatch(removeAnnotationById(annotation.id));
                });

                // add listeners
                annotatorInstance.on('viewportIntersect', (annotations: any) => {
                    dispatch(setAnnotations(annotations))
                });
                annotatorInstance.on('updateAnnotation', (updated: any, previous: any) => {
                    dispatch(updateAnnotationById({
                        id: previous.id,
                        data: updated
                    }))
                    console.log(updated)
                })
                annotatorInstance.on('selectionChanged', (annotations: any) => {
                    dispatch(toggleEditPanel())
                });

                // parse persisted data
                for (const annotation of annotations) {
                    annotatorInstance.addAnnotation(annotation);
                }

                return () => {
                    if (annotatorInstance) {
                        annotatorInstance.clearAnnotations();
                    }

                    if (viewerRef.current) {
                        viewerRef.current = null;
                    }
                }
        }
    }, [annotatorInstance]);


    useEffect(() => {
        console.log('annotatorInstance:', annotatorInstance);
        console.log('annotatorInstance.viewer:', annotatorInstance?.viewer);
        console.log('editAnnotation:', editAnnotation);
        if (annotatorInstance && annotatorInstance.viewer && editAnnotation) {
            annotatorInstance.fitBounds(editAnnotation, { immediately: true, padding: 20 });
        }
    }, [editAnnotation, annotatorInstance]);


    // add new annotation
    const addNewAnnotation = async (annotation: any) => {
        console.log('Adding new annotation:', annotation);
        if (annotatorRef.current) {
            try {
                await annotatorRef.current.addAnnotation(annotation);
                console.log('Annotation added successfully');
                dispatch(addAnnotation(annotation));

            } catch (error) {
                console.error('Error adding annotation:', error);
            }
        } else {
            console.warn('Annotator instance not available');
        }
    };


    return { annotatorInstance, viewerRef, addNewAnnotation }
};

export default useAnnotatorInitialization;
