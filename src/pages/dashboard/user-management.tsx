"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { useToast } from "../../hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { LoadingSpinner } from "../../components/ui/loading-spinner"
import { UserModal } from "../../components/users/user-modal"
import { DeleteUserDialog } from "../../components/users/delete-user-dialog"
import { Badge } from "../../components/ui/badge"
import { useDebounce } from "../../hooks/use-debounce"
import { useTranslation } from "react-i18next"

interface User {
  id: string
  name: string
  username: string
  emailId: string
  role: string
  phoneNo: string
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
}

export default function UserManagementPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedUserSearch = useDebounce(searchTerm, 300)
  const [sortField, setSortField] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const limit = 10

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", currentPage, debouncedUserSearch],
    queryFn: () =>
      adminApi.getUsers({
        page: currentPage,
        limit,
        search: debouncedUserSearch
      }),

  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Success",
        description: t('addUser.userDeletedSuccessfully'),
        className: "bg-success text-white [&_button]:text-white"
      })
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || t('addUser.failedToDeleteUser'),
        variant: "destructive",
      })
    },
  })

  const users = usersData?.users || []
  const total = usersData?.total || 0
  const totalPages = Math.ceil(total / limit)

  const processedUserData = useMemo(() => {
    if (users && users.length > 0) {
      const sortedUser = [...users].sort((a, b) => {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      return sortedUser;
    }
    return [];
  }, [users, sortField, sortOrder])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleCreate = () => {
    setModalMode("create")
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setModalMode("edit")
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200 hover:!bg-red-100"
      case "executive":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:!bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 bg-gray-100"
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{t('addUser.errorLoadingUsers')}</h3>
          <p className="text-muted-foreground">{t('pleaseTryAgainLater')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('addUser.title')}</h1>
          <p className="text-muted-foreground">{t('addUser.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          {t('addUser.createUserButton')}
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('addUser.searchUser')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 form-input"
          />
        </div>
        <div className="text-gray-900 dark:text-white">{t('total')}: <span className="font-semibold">{total}</span> {t('users')}</div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            {t('addUser.table.UserListTableTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg"/>
            </div>
          ) : processedUserData.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('addUser.noUsersFound')}</h3>
              <p className="text-muted-foreground mb-4">{t('addUser.GetStartedByCreatingYourFirstUser')}</p>
              <Button onClick={handleCreate} className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('addUser.createUserButton')}
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        {t('addUser.table.name')}
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground">
                      <div className="flex items-center">
                        {t('addUser.table.userName')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground">
                      <div className="flex items-center">
                        {t('addUser.table.userEmail')}
                      </div>
                    </TableHead>
                    <TableHead>{t('addUser.table.userPhone')}</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("role")}>
                      <div className="flex items-center">
                        {t('addUser.table.userRole')}
                        {getSortIcon("role")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("createdAt")}>
                      <div className="flex items-center">
                        {t('created').split('')[0].toUpperCase() + t('created').slice(1) }
                        {getSortIcon("createdAt")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">{t('addUser.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedUserData.map((user: User) => (
                    <TableRow key={user.id} className="table-row">
                      <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                      <TableCell className="text-foreground">{user.username}</TableCell>
                      <TableCell className="text-foreground">{user.emailId}</TableCell>
                      <TableCell className="text-foreground">{user.phoneNo}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} border`}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* Uncomment to have delete function for user management */}
                          {/* <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t('showing')} {(currentPage - 1) * limit + 1} {t('to')} {Math.min(currentPage * limit, total)} {t('of')} {total} {t('users')}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('page')} {currentPage} {t('of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} mode={modalMode} />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        userName={selectedUser?.name || ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
