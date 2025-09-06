"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { Globe } from "lucide-react"
import i18n from "../../lib/i18n"
import { useTranslation } from "react-i18next"

export function LanguageSection() {
  const { t } = useTranslation();
  let languageSelected = localStorage.getItem("selectedLanguage");
  const [selectedLanguage, setSelectedLanguage] = useState(!languageSelected ? "en" : languageSelected);
  const { toast } = useToast()

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    localStorage.setItem("selectedLanguage", language)
    i18n.changeLanguage(language)
    toast({
      title: "Language Updated",
      description: `Language changed to ${language === "en" ? "English" : "Chinese"}`,
      className: "bg-success text-white [&_button]:text-white",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('language.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('language.selectLanguage')}</Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">Chinese (中文)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> {t('language.inputNote')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
