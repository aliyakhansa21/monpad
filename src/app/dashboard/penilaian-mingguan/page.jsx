"use client";
import React, { useState, useMemo, useEffect } from "react";
import PenilaianMingguanTable from "@/components/organism/PenilaianMingguanTable";
import DashboardHeader from "@/components/organism/DashboardHeader";
import MingguSelect from "@/components/molecules/MingguSelect";
import InputNilaiModal from "@/components/organism/InputNilaiModal";
import ReviewModal from "@/components/organism/ReviewModal";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext"; 

const extractUniqueProjects = (allGroups) => {
    const projects = [];
    allGroups.forEach((group) => {
        if (group.project_id) {
            projects.push({
                id: group.project_id.toString(),
                name: group.nama || `Kelompok #${group.id}`,
                group_name: group.nama || "Tidak ada kelompok",
            });
        }
    });
    return projects;
};

export default function PenilaianMingguanPage() {
    const { role } = useAuth();      
    const userRole = role;           

    const [penilaianData, setPenilaianData] = useState([]);
    const [gradeTypes, setGradeTypes] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [mingguOptions, setMingguOptions] = useState([]);
    const [weekTypeList, setWeekTypeList] = useState([]);
    const [selectedMinggu, setSelectedMinggu] = useState("");

    const [isLoadingMinggu, setIsLoadingMinggu] = useState(true);
    const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);

    const [isInputNilaiModalOpen, setIsInputNilaiModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [allProjectsData, setAllProjectsData] = useState([]);

    //fetch data
    const fetchAllWeeksAndExtractTypes = async () => {
        setIsLoadingMinggu(true);
        setIsLoadingAssessment(true);

        try {
            const [weeksRes, groupsRes, projectsRes] = await Promise.all([
                api.get("/week"),
                api.get("/group"),
                api.get("/project"),
            ]);

            const allWeeksData = weeksRes.data.data || [];
            const allGroupsData = groupsRes.data.data || [];
            const allProjectsDataRes = projectsRes.data.data || [];

            const projectInfoMap = new Map();

            allProjectsDataRes.forEach((project) => {
                projectInfoMap.set(project.id, {
                    project_name: project.nama_projek,
                    group_name: null,
                });
            });

            allGroupsData.forEach((group) => {
                if (group.project_id && projectInfoMap.has(group.project_id)) {
                    const ex = projectInfoMap.get(group.project_id);
                    projectInfoMap.set(group.project_id, {
                        ...ex,
                        group_name: group.nama,
                    });
                }
            });

            const projectsForModal = extractUniqueProjects(allGroupsData);
            setAllProjectsData(projectsForModal);

            const combined = allWeeksData.map((week) => {
                const info = projectInfoMap.get(week.project_id);
                return {
                    ...week,
                    project: info
                        ? {
                            id: week.project_id,
                            group_name: info.group_name,
                            nama_projek: info.project_name,
                        }
                        : {
                            id: week.project_id,
                            group_name: "-",
                            nama_projek: "Proyek Tidak Ditemukan",
                        },
                };
            });

            setPenilaianData(combined);

            const uniqueWeekTypes = Array.from(
                new Map(
                    combined
                        .filter((w) => w.week_type)
                        .map((w) => [w.week_type.id, w.week_type])
                ).values()
            );

            setWeekTypeList(uniqueWeekTypes);

            const options = uniqueWeekTypes.map((wt) => ({
                value: wt.id.toString(),
                label: wt.name,
            }));

            setMingguOptions(options);
            if (options.length > 0 && !selectedMinggu) {
                setSelectedMinggu(options[0].value);
            }

            const uniqueGradeTypes = Array.from(
                new Map(
                    combined
                        .flatMap((w) => w.grades || [])
                        .map((g) => [g.grade_type.id, g.grade_type])
                ).values()
            );

            setGradeTypes(uniqueGradeTypes);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMinggu(false);
            setIsLoadingAssessment(false);
        }
    };

    useEffect(() => {
        fetchAllWeeksAndExtractTypes();
    }, []);

    const handleSaveSuccess = () => {
        setIsInputNilaiModalOpen(false);
        setIsReviewModalOpen(false);
        fetchAllWeeksAndExtractTypes();
    };

    // action
    const handleReview = (item = null) => {
        setSelectedItem(item);

        if (userRole === "asisten") {
            setIsInputNilaiModalOpen(true);
        }

        if (userRole === "dosen" && item) {
            setIsReviewModalOpen(true);
        }
    };

    // filter
    const filteredData = useMemo(() => {
        const dataByWeek = penilaianData.filter((i) => {
            return (
                i.week_type?.id &&
                i.week_type.id.toString() === selectedMinggu.toString()
            );
        });

        if (!searchTerm) return dataByWeek;

        const q = searchTerm.toLowerCase();

        return dataByWeek.filter((i) => {
            return (
                i.project?.nama_projek?.toLowerCase().includes(q) ||
                i.project?.group_name?.toLowerCase().includes(q) ||
                i.notes?.toLowerCase().includes(q)
            );
        });
    }, [penilaianData, searchTerm, selectedMinggu]);

    const currentWeekType = weekTypeList.find(
        (w) => w.id.toString() === selectedMinggu
    );

    return (
        <>
            {/* Modal Asisten */}
            {userRole === "asisten" && (
                <InputNilaiModal
                    isOpen={isInputNilaiModalOpen}
                    onClose={() => setIsInputNilaiModalOpen(false)}
                    onSaveSuccess={handleSaveSuccess}
                    gradeTypes={gradeTypes}
                    weekTypeId={
                        currentWeekType ? parseInt(currentWeekType.id) : null
                    }
                    projectsData={allProjectsData}
                    isLoadingProjects={
                        isLoadingMinggu || isLoadingAssessment
                    }
                    itemToEdit={selectedItem}
                />
            )}

            {/* Modal Dosen */}
            {userRole === "dosen" && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSaveSuccess={handleSaveSuccess}
                    itemToReview={selectedItem}
                    gradeTypes={gradeTypes}
                />
            )}

            <DashboardHeader title="Laporan Mingguan" />

            <div className="p-4 flex items-center space-x-4">
                <MingguSelect
                    options={mingguOptions}
                    selectedMinggu={selectedMinggu}
                    onMingguChange={setSelectedMinggu}
                    isLoading={isLoadingMinggu}
                />
            </div>

            <main className="p-4">
                <PenilaianMingguanTable
                    data={filteredData}
                    gradeTypes={gradeTypes}
                    onSearch={setSearchTerm}
                    onReview={handleReview}
                    userRole={userRole}
                    isLoading={isLoadingAssessment || isLoadingMinggu}
                    totalPages={1}
                    currentPage={1}
                    onPageChange={() => {}}
                    totalWeekWeight={100}
                />
            </main>
        </>
    );
}
