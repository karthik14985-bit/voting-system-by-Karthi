import React, { useState } from 'react';
import { useVotingData } from '../../hooks/useVotingData';
import type { Candidate } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

const CandidateForm: React.FC<{
    onSubmit: (candidate: Omit<Candidate, 'id' | 'votes'> | Candidate) => Promise<void>;
    onClose: () => void;
    candidateToEdit?: Candidate | null;
}> = ({ onSubmit, onClose, candidateToEdit }) => {
    const [name, setName] = useState(candidateToEdit?.name || '');
    const [party, setParty] = useState(candidateToEdit?.party || '');
    const [description, setDescription] = useState(candidateToEdit?.description || '');
    const [photoUrl, setPhotoUrl] = useState(candidateToEdit?.photoUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const finalPhotoUrl = photoUrl || `https://picsum.photos/seed/${name.replace(/\s+/g, '')}/400/400`;
        const candidateData = { name, party, description, photoUrl: finalPhotoUrl };
        
        try {
            if (candidateToEdit) {
                await onSubmit({ ...candidateToEdit, ...candidateData });
            } else {
                await onSubmit(candidateData);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isSubmitting}>
                <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input id="party" label="Party" value={party} onChange={(e) => setParty(e.target.value)} required />
                
                <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Candidate Photo
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                         {photoUrl && (
                            <img src={photoUrl} alt="Candidate preview" className="w-16 h-16 rounded-full object-cover bg-gray-200 dark:bg-gray-700" />
                        )}
                        <input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                        />
                    </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If no image is uploaded, a placeholder will be generated.</p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                </div>
            </fieldset>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (candidateToEdit ? 'Update Candidate' : 'Add Candidate')}
                </Button>
            </div>
        </form>
    );
};

const CandidateManagement: React.FC = () => {
    const { candidates, addCandidate, updateCandidate, deleteCandidate, isLoading } = useVotingData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);

    const handleOpenModal = (candidate?: Candidate) => {
        setCandidateToEdit(candidate || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCandidateToEdit(null);
    };

    const handleSubmit = async (candidateData: Omit<Candidate, 'id' | 'votes'> | Candidate) => {
        if ('id' in candidateData) {
            await updateCandidate(candidateData);
        } else {
            await addCandidate(candidateData);
        }
        handleCloseModal();
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => handleOpenModal()} className="w-auto">Add New Candidate</Button>
            </div>
            
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Photo</th>
                            <th scope="col" className="py-3 px-6">Name</th>
                            <th scope="col" className="py-3 px-6">Party</th>
                            <th scope="col" className="py-3 px-6">Votes</th>
                            <th scope="col" className="py-3 px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading.candidates ? (
                            <tr><td colSpan={5} className="text-center p-6">Loading candidates...</td></tr>
                        ) : candidates.map(c => (
                            <tr key={c.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="py-4 px-6">
                                    <img src={c.photoUrl} alt={c.name} className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700" />
                                </td>
                                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {c.name}
                                </th>
                                <td className="py-4 px-6">{c.party}</td>
                                <td className="py-4 px-6 font-bold">{c.votes}</td>
                                <td className="py-4 px-6">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleOpenModal(c)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                                        <button onClick={() => deleteCandidate(c.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={candidateToEdit ? 'Edit Candidate' : 'Add New Candidate'}
            >
                <CandidateForm onSubmit={handleSubmit} onClose={handleCloseModal} candidateToEdit={candidateToEdit} />
            </Modal>
        </div>
    );
};

export default CandidateManagement;