
import connectDB from '@/db/connection';
import Semester from '@/db/models/Semester';
import Subject from '@/db/models/Subject';
import PDF from '@/db/models/PDF';
import { Semester as SemesterType, Subject as SubjectType } from '@/hooks/useSemesterSubjectStore';
import { PDF as PDFType } from '@/hooks/usePdfStore';
import mongoose from 'mongoose';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Connect to MongoDB on service initialization (only in server environment)
if (!isBrowser) {
  connectDB();
}

// Generate MongoDB-compatible ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default semesters to create if none exist
const DEFAULT_SEMESTERS = [
  { name: 'Semester 1', order: 1 },
  { name: 'Semester 2', order: 2 },
  { name: 'Semester 3', order: 3 },
  { name: 'Semester 4', order: 4 },
  { name: 'Semester 5', order: 5 },
  { name: 'Semester 6', order: 6 },
  { name: 'Semester 7', order: 7 },
  { name: 'Semester 8', order: 8 }
];

// Semester API
export const SemesterAPI = {
  // Get all semesters
  getAll: async (): Promise<SemesterType[]> => {
    try {
      // In browser, Semester might be null
      if (isBrowser || !Semester) {
        console.log('Using fallback for semesters in browser');
        // Return semesters from localStorage if available
        const storedSemesters = localStorage.getItem('semesters');
        if (storedSemesters) {
          return JSON.parse(storedSemesters);
        }
        return [];
      }
      
      let semesters = await Semester.find().sort({ order: 1, name: 1 });
      
      // If no semesters exist, create the default ones
      if (semesters.length === 0) {
        console.log('No semesters found, creating defaults');
        
        // Create default semesters
        for (const semData of DEFAULT_SEMESTERS) {
          try {
            const newSemester = new Semester({
              name: semData.name,
              order: semData.order,
              _id: generateId()
            });
            await newSemester.save();
          } catch (err) {
            console.error(`Error creating default semester ${semData.name}:`, err);
          }
        }
        
        // Fetch again after creating defaults
        semesters = await Semester.find().sort({ order: 1, name: 1 });
      }
      
      return semesters.map(sem => ({
        id: sem._id.toString(),
        name: sem.name,
        order: sem.order || 0
      }));
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return [];
    }
  },

  // Add a new semester
  add: async (name: string, order?: number): Promise<SemesterType | null> => {
    try {
      // In browser, Semester might be null
      if (isBrowser || !Semester) {
        console.log('Using fallback for adding semester in browser');
        // Generate local semester
        const newId = generateId();
        const newSemester = {
          id: newId,
          name,
          order: order || 0
        };
        
        // Store in localStorage
        const storedSemesters = localStorage.getItem('semesters');
        const semesters = storedSemesters ? JSON.parse(storedSemesters) : [];
        localStorage.setItem('semesters', JSON.stringify([...semesters, newSemester]));
        
        return newSemester;
      }
      
      // Find the highest order if not provided
      let semesterOrder = order;
      if (!semesterOrder) {
        const highestSem = await Semester.findOne().sort({ order: -1 });
        semesterOrder = highestSem ? (highestSem.order + 1) : 1;
      }
      
      const newSemester = new Semester({
        name,
        order: semesterOrder,
        _id: generateId()
      });
      await newSemester.save();
      return {
        id: newSemester._id.toString(),
        name: newSemester.name,
        order: newSemester.order
      };
    } catch (error) {
      console.error('Error adding semester:', error);
      return null;
    }
  },

  // Update a semester
  update: async (id: string, data: Partial<SemesterType>): Promise<boolean> => {
    try {
      // In browser, Semester might be null
      if (isBrowser || !Semester) {
        console.log('Using fallback for updating semester in browser');
        
        // Update in localStorage
        const storedSemesters = localStorage.getItem('semesters');
        if (storedSemesters) {
          const semesters = JSON.parse(storedSemesters);
          const updatedSemesters = semesters.map((sem: SemesterType) => 
            sem.id === id ? { ...sem, ...data } : sem
          );
          localStorage.setItem('semesters', JSON.stringify(updatedSemesters));
        }
        
        return true;
      }
      
      await Semester.findByIdAndUpdate(id, data);
      return true;
    } catch (error) {
      console.error('Error updating semester:', error);
      return false;
    }
  },

  // Delete a semester
  delete: async (id: string): Promise<boolean> => {
    try {
      // In browser, Semester might be null
      if (isBrowser || !Semester) {
        console.log('Using fallback for deleting semester in browser');
        
        // Delete from localStorage
        const storedSemesters = localStorage.getItem('semesters');
        if (storedSemesters) {
          const semesters = JSON.parse(storedSemesters);
          const filteredSemesters = semesters.filter((sem: SemesterType) => sem.id !== id);
          localStorage.setItem('semesters', JSON.stringify(filteredSemesters));
        }
        
        return true;
      }
      
      await Semester.findByIdAndDelete(id);
      return true;
    } catch (error) {
      console.error('Error deleting semester:', error);
      return false;
    }
  }
};

// Subject API
export const SubjectAPI = {
  // Get all subjects
  getAll: async (): Promise<SubjectType[]> => {
    try {
      // In browser, Subject might be null
      if (isBrowser || !Subject) {
        console.log('Using fallback for subjects in browser');
        // Return subjects from localStorage if available
        const storedSubjects = localStorage.getItem('subjects');
        if (storedSubjects) {
          return JSON.parse(storedSubjects);
        }
        return [];
      }
      
      const subjects = await Subject.find().sort({ name: 1 });
      return subjects.map(sub => ({
        id: sub._id.toString(),
        name: sub.name,
        semesterId: sub.semesterId
      }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  },

  // Add a new subject
  add: async (name: string, semesterId: string): Promise<SubjectType | null> => {
    try {
      // In browser, Subject might be null
      if (isBrowser || !Subject) {
        console.log('Using fallback for adding subject in browser');
        // Generate local subject
        const newId = generateId();
        const newSubject = {
          id: newId,
          name,
          semesterId
        };
        
        // Store in localStorage
        const storedSubjects = localStorage.getItem('subjects');
        const subjects = storedSubjects ? JSON.parse(storedSubjects) : [];
        localStorage.setItem('subjects', JSON.stringify([...subjects, newSubject]));
        
        return newSubject;
      }
      
      const newSubject = new Subject({
        name,
        semesterId,
        _id: generateId()
      });
      await newSubject.save();
      return {
        id: newSubject._id.toString(),
        name: newSubject.name,
        semesterId: newSubject.semesterId
      };
    } catch (error) {
      console.error('Error adding subject:', error);
      return null;
    }
  },

  // Update a subject
  update: async (id: string, data: Partial<SubjectType>): Promise<boolean> => {
    try {
      // In browser, Subject might be null
      if (isBrowser || !Subject) {
        console.log('Using fallback for updating subject in browser');
        
        // Update in localStorage
        const storedSubjects = localStorage.getItem('subjects');
        if (storedSubjects) {
          const subjects = JSON.parse(storedSubjects);
          const updatedSubjects = subjects.map((sub: SubjectType) => 
            sub.id === id ? { ...sub, ...data } : sub
          );
          localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
        }
        
        return true;
      }
      
      await Subject.findByIdAndUpdate(id, data);
      return true;
    } catch (error) {
      console.error('Error updating subject:', error);
      return false;
    }
  },

  // Delete a subject
  delete: async (id: string): Promise<boolean> => {
    try {
      // In browser, Subject might be null
      if (isBrowser || !Subject) {
        console.log('Using fallback for deleting subject in browser');
        
        // Delete from localStorage
        const storedSubjects = localStorage.getItem('subjects');
        if (storedSubjects) {
          const subjects = JSON.parse(storedSubjects);
          const filteredSubjects = subjects.filter((sub: SubjectType) => sub.id !== id);
          localStorage.setItem('subjects', JSON.stringify(filteredSubjects));
        }
        
        return true;
      }
      
      await Subject.findByIdAndDelete(id);
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      return false;
    }
  },

  // Get subjects by semester
  getBySemester: async (semesterId: string): Promise<SubjectType[]> => {
    try {
      // In browser, Subject might be null
      if (isBrowser || !Subject) {
        console.log('Using fallback for getting subjects by semester in browser');
        
        // Filter subjects from localStorage
        const storedSubjects = localStorage.getItem('subjects');
        if (storedSubjects) {
          const subjects = JSON.parse(storedSubjects);
          return subjects.filter((sub: SubjectType) => sub.semesterId === semesterId);
        }
        return [];
      }
      
      const subjects = await Subject.find({ semesterId }).sort({ name: 1 });
      return subjects.map(sub => ({
        id: sub._id.toString(),
        name: sub.name,
        semesterId: sub.semesterId
      }));
    } catch (error) {
      console.error('Error fetching subjects by semester:', error);
      return [];
    }
  }
};

// PDF API
export const PDFAPI = {
  // Get all PDFs
  getAll: async (): Promise<PDFType[]> => {
    try {
      // Check if PDF model is available
      if (!PDF || typeof PDF.find !== 'function') {
        console.error('PDF model is not properly initialized');
        return [];
      }
      
      const pdfs = await PDF.find().sort({ createdAt: -1 });
      return pdfs.map(pdf => ({
        id: pdf._id.toString(),
        title: pdf.title,
        fileName: pdf.fileName,
        fileUrl: pdf.fileUrl,
        semesterId: pdf.semesterId,
        subjectId: pdf.subjectId,
        createdAt: pdf.createdAt.getTime()
      }));
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      return [];
    }
  },

  // Add a new PDF
  add: async (pdf: Omit<PDFType, 'id' | 'createdAt'>): Promise<PDFType | null> => {
    try {
      const newPDF = new PDF({
        ...pdf,
        _id: generateId(),
        createdAt: new Date()
      });
      await newPDF.save();
      return {
        id: newPDF._id.toString(),
        title: newPDF.title,
        fileName: newPDF.fileName,
        fileUrl: newPDF.fileUrl,
        semesterId: newPDF.semesterId,
        subjectId: newPDF.subjectId,
        createdAt: newPDF.createdAt.getTime()
      };
    } catch (error) {
      console.error('Error adding PDF:', error);
      return null;
    }
  },

  // Update a PDF
  update: async (id: string, data: Partial<PDFType>): Promise<boolean> => {
    try {
      await PDF.findByIdAndUpdate(id, data);
      return true;
    } catch (error) {
      console.error('Error updating PDF:', error);
      return false;
    }
  },

  // Delete a PDF
  delete: async (id: string): Promise<boolean> => {
    try {
      await PDF.findByIdAndDelete(id);
      return true;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
  },

  // Get PDFs by subject
  getBySubject: async (subjectId: string): Promise<PDFType[]> => {
    try {
      const pdfs = await PDF.find({ subjectId }).sort({ createdAt: -1 });
      return pdfs.map(pdf => ({
        id: pdf._id.toString(),
        title: pdf.title,
        fileName: pdf.fileName,
        fileUrl: pdf.fileUrl,
        semesterId: pdf.semesterId,
        subjectId: pdf.subjectId,
        createdAt: pdf.createdAt.getTime()
      }));
    } catch (error) {
      console.error('Error fetching PDFs by subject:', error);
      return [];
    }
  },

  // Get PDFs by semester
  getBySemester: async (semesterId: string): Promise<PDFType[]> => {
    try {
      const pdfs = await PDF.find({ semesterId }).sort({ createdAt: -1 });
      return pdfs.map(pdf => ({
        id: pdf._id.toString(),
        title: pdf.title,
        fileName: pdf.fileName,
        fileUrl: pdf.fileUrl,
        semesterId: pdf.semesterId,
        subjectId: pdf.subjectId,
        createdAt: pdf.createdAt.getTime()
      }));
    } catch (error) {
      console.error('Error fetching PDFs by semester:', error);
      return [];
    }
  }
};
